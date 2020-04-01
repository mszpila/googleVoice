#include <WiFi.h> // ESP32 WiFi include
#include <WiFiConfig.h> // My WiFi configuration.
#include <HTTPClient.h>
#include <BigNumber.h>
#include <ecdsa.h>

#include <ArduinoJson.h>

#include <sstream>

WiFiClientSecure client;

#include <infuraConfig.h>
//#include <infura_ca.h>
//#include <hostConfig.h>
//#include <pathConfig.h>
//#include <ArduinoJson.h>

//StaticJsonBuffer<147> jsonBuffer;
DynamicJsonDocument doc(1024);
//BigNumber bigNum;

const String myAddress = "0x0b08d49019e8823aa4ae64da58af006c9e599bb5";
const String contractAddress = "0xe404D58912275DF2Ade873255c2Eeae60cC70853";
const String getData = "0x1865c57d"; // first 8 characters from keccak-256 converstion, input getData() or getState() depend on the function in the contract
const String setData = "0x915d5862"; // same as above but for swithTheLight()

const String hostname = "ropsten.infura.io";
const String pathname = ""; // infura key

const int ledPin = 27;
char servername[]="ropsten.infura.io";

void setup() {
  // put your setup code here, to run once:
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.begin(115200);
  ConnectToWiFi();
  web3Prove();
}

void loop() {
  // put your main code here, to run repeatedly:
  StateOfLight();
  delay(500);

}

void ConnectToWiFi(){
 
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, WiFiPassword);
  Serial.print("Connecting to "); Serial.println(SSID);
 
  uint8_t i = 0;
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print('.');
    delay(500);
 
    if ((++i % 16) == 0)
    {
      Serial.println(F(" still trying to connect"));
    }
  }
 
  Serial.print(F("Connected. My IP address is: "));
  Serial.println(WiFi.localIP());
}

void web3Prove() {
  String result = web3ClientVersion();
  Serial.println("web3_ClientVersion");
  Serial.println(result.c_str());
}

String web3ClientVersion() {    
    String m = "web3_clientVersion";                
    String p = "[]";                                
    String input = generateJson(&m, &p);            
    return exec(&input);                 
//    return getString(&output);                    
}

void StateOfLight() {
  String result = callContract();
  Serial.println("eth_call => getData()");
  Serial.println(result.c_str());
  deserializeJson(doc, result);
  JsonObject obj = doc.as<JsonObject>();

  String bigNumStr = obj[("result")];
  //bigNum = bigNumStr;
  //Serial.println(bigNum);

  if (bigNumStr == "0x0000000000000000000000000000000000000000000000000000000000000001") {
    Serial.println("The light is: ON ");
    digitalWrite(ledPin, HIGH);
  } else if(bigNumStr == "0x0000000000000000000000000000000000000000000000000000000000000000") {
    Serial.println("The light is: OFF ");
    digitalWrite(ledPin, LOW);
  }
}

String generateJson(const String* method, const String* params) {    
  return "{\"jsonrpc\":\"2.0\",\"method\":\"" + *method + "\",\"params\":" + *params + ",\"id\":0}";
}

String exec(const String* dataReq) {    
    String result;     
    
    // start connection   
    //LOG("\nStarting connection to server...");    
    int connected = client.connect(servername, 443); 
               //   client.connect(URL, port)
    if (!connected) {        
        return "";    
    }     
    //LOG("Connected to server!");    
    // Make a HTTP request:    
    //int l = data->size();    
    //StringStream ss;    
    //ss << l;    
    //String lstr = ss.str();   // how about int l = input.length()?  
    int len = dataReq->length();
    String lenStr = String(len);
    
    String strPost = "POST " + pathname + " HTTP/1.1";    
    String strHost = "Host: " + hostname;    
    String strContentLen = "Content-Length: " + lenStr;   
    client.println(strPost.c_str());       
    client.println(strHost.c_str());    
    client.println("Content-Type: application/json");     
    client.println(strContentLen.c_str());     
    client.println("Connection: close");    
    client.println();    
    client.println(dataReq->c_str()); 
        
    while (client.connected()) {        
        String line = client.readStringUntil('\n'); 
  //  odczytuje dane z bufora aż do napotkania konkretnego znaku  
        //LOG(line.c_str());   // LOG is not declared     
        if (line == "\r") {            
             break;        
        }    
    }
    // if there are incoming bytes available    
    // from the server, read them and print them:    
    while (client.available()) {        
        char c = client.read();        
        result += c;    
    }    
    
    //LOG(result.c_str());     
    client.stop();     
    return result;
}

String callContract() {    
    String m = "eth_call";                
    String p = "[{\"from\":\"" + myAddress + "\",\"to\":\""
               + contractAddress + "\",\"data\":\"" + getData + "\"}, \"latest\"]";                                
    String input = generateJson(&m, &p);            
    return exec(&input);                 
//    return getString(&output);                    
}
