/*
 * WattWise Edge - Canonical ESP32 Firmware
 * =========================================
 * Single-Machine Electrical Monitoring & Overcurrent Protection
 *
 * Hardware Wiring:
 * ----------------
 *   SSD1306 128x64 I2C OLED (Address: 0x3C):
 *     - VCC -> 3.3V / VIN
 *     - GND -> GND
 *     - SDA -> GPIO 21
 *     - SCL -> GPIO 22
 *
 *   Overcurrent Status LED (Red):
 *     - Anode -> GPIO 25 (through 220Ω series resistor)
 *     - Cathode -> GND
 *     - Logic: ON when Current > 5.0 A; otherwise OFF.
 *
 * Serial Protocol:
 * ----------------
 *   - Baud Rate: 115200
 *   - Line Termination: '\n'
 *   - Format: "current,voltage,power\n"
 *   - Example: "2.50,230.00,546.25\n"
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C

// Hardware Pins
#define PIN_OVERCURRENT_LED 25
#define OVERCURRENT_THRESHOLD 5.0

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Telemetry State
float currentVal = 0.0;
float voltageVal = 0.0;
float powerVal = 0.0;
bool isOvercurrent = false;

// Connection & Timeout State
bool hasReceivedFirstReading = false;
unsigned long lastPacketTime = 0;
const unsigned long TIMEOUT_MS = 15000; // 15 seconds

// Non-blocking UART Line Buffer
char rxBuffer[128];
int rxIndex = 0;

// Function Prototypes
bool parseTelemetryCSV(char* payload);
void refreshOLED();

void setup() {
  Serial.begin(115200);
  delay(100);

  // Initialize Red Overcurrent LED
  pinMode(PIN_OVERCURRENT_LED, OUTPUT);
  digitalWrite(PIN_OVERCURRENT_LED, LOW);

  // Initialize I2C for SSD1306 OLED (SDA: 21, SCL: 22)
  Wire.begin(21, 22);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("[ESP32 ERR] SSD1306 OLED init failed on 0x3C. Check SDA=21, SCL=22."));
  } else {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(14, 10);
    display.println(F("WattWise Edge"));
    display.drawLine(10, 22, 118, 22, SSD1306_WHITE);
    display.setCursor(12, 34);
    display.println(F("Waiting for data..."));
    display.setCursor(12, 48);
    display.println(F("Baud: 115200"));
    display.display();
  }

  // LED Boot Blink Self-Test
  digitalWrite(PIN_OVERCURRENT_LED, HIGH);
  delay(200);
  digitalWrite(PIN_OVERCURRENT_LED, LOW);

  Serial.println(F("[ESP32 BOOT] WattWise Edge ready. Awaiting CSV stream at 115200 baud..."));
}

void loop() {
  // Non-blocking UART Line Reader
  while (Serial.available() > 0) {
    char c = (char)Serial.read();

    if (c == '\n' || c == '\r') {
      if (rxIndex > 0) {
        rxBuffer[rxIndex] = '\0';
        bool parsed = parseTelemetryCSV(rxBuffer);
        if (parsed) {
          hasReceivedFirstReading = true;
          lastPacketTime = millis();

          // Apply Red Overcurrent LED state
          digitalWrite(PIN_OVERCURRENT_LED, isOvercurrent ? HIGH : LOW);

          // Refresh OLED immediately upon receiving valid reading
          refreshOLED();
        } else {
          Serial.print(F("[ESP32 PARSE ERR] Unrecognized packet: "));
          Serial.println(rxBuffer);
        }
        rxIndex = 0;
      }
    } else {
      if (rxIndex < (sizeof(rxBuffer) - 1)) {
        rxBuffer[rxIndex++] = c;
      } else {
        rxIndex = 0; // Prevent buffer overrun
      }
    }
  }

  // Check 15-second data timeout
  if (hasReceivedFirstReading) {
    static unsigned long lastCheck = 0;
    if (millis() - lastCheck > 1000) {
      lastCheck = millis();
      if (millis() - lastPacketTime > TIMEOUT_MS) {
        refreshOLED();
      }
    }
  }

  delay(10);
}

bool parseTelemetryCSV(char* payload) {
  // Supports canonical "current,voltage,power" and optional extended fields
  // Example: "2.50,230.00,546.25"
  // Also supports prefix "V2,..." or "WW1,..." if present for backward compatibility
  char* strPtr = payload;
  if (strncmp(strPtr, "V2,", 3) == 0) {
    // Skip V2 header, seq, timestamp
    strtok(strPtr, ","); // V2
    strtok(NULL, ",");   // seq
    strtok(NULL, ",");   // time
    char* t_curr = strtok(NULL, ",");
    char* t_volt = strtok(NULL, ",");
    char* t_pwr = strtok(NULL, ",");
    if (t_curr && t_volt && t_pwr) {
      currentVal = atof(t_curr);
      voltageVal = atof(t_volt);
      powerVal = atof(t_pwr);
      isOvercurrent = (currentVal > OVERCURRENT_THRESHOLD);

      Serial.print(F("[ESP32 RX] I="));
      Serial.print(currentVal, 2);
      Serial.print(F(" A | V="));
      Serial.print(voltageVal, 2);
      Serial.print(F(" V | P="));
      Serial.print(powerVal, 2);
      Serial.print(F(" W | Status="));
      Serial.println(isOvercurrent ? F("OVERCURRENT") : F("NORMAL"));
      return true;
    }
    return false;
  }

  char* t0 = strtok(strPtr, ","); // current
  char* t1 = strtok(NULL, ",");    // voltage
  char* t2 = strtok(NULL, ",");    // power

  if (t0 && t1) {
    currentVal = atof(t0);
    voltageVal = atof(t1);
    powerVal = t2 ? atof(t2) : (voltageVal * currentVal * 0.95);
    isOvercurrent = (currentVal > OVERCURRENT_THRESHOLD);

    Serial.print(F("[ESP32 RX] I="));
    Serial.print(currentVal, 2);
    Serial.print(F(" A | V="));
    Serial.print(voltageVal, 2);
    Serial.print(F(" V | P="));
    Serial.print(powerVal, 2);
    Serial.print(F(" W | Status="));
    Serial.println(isOvercurrent ? F("OVERCURRENT") : F("NORMAL"));
    return true;
  }

  return false;
}

void refreshOLED() {
  if (!hasReceivedFirstReading) return;

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  bool isTimeout = (millis() - lastPacketTime > TIMEOUT_MS);

  // Title: WattWise Edge
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("WattWise Edge"));
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  if (isTimeout) {
    display.setCursor(0, 13);
    display.print(F("! DATA TIMEOUT !"));
  }

  // Current (A) - Large clear font
  display.setCursor(0, isTimeout ? 24 : 14);
  display.setTextSize(2);
  display.print(currentVal, 2);
  display.setTextSize(1);
  display.print(F(" A"));

  // Voltage (V)
  display.setCursor(0, isTimeout ? 42 : 33);
  display.print(F("Voltage: "));
  display.print(voltageVal, 1);
  display.print(F(" V"));

  // Power (W)
  display.setCursor(0, isTimeout ? 52 : 44);
  display.print(F("Power:   "));
  display.print(powerVal, 1);
  display.print(F(" W"));

  // Status: NORMAL or OVERCURRENT
  if (!isTimeout) {
    display.setCursor(0, 55);
    display.print(F("Status:  "));
    if (isOvercurrent) {
      display.print(F("OVERCURRENT"));
    } else {
      display.print(F("NORMAL"));
    }
  }

  display.display();
}
