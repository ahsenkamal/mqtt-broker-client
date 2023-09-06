const mqtt = require('mqtt')
const protocol = 'mqtt'
const host = '192.168.85.58'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: '',
  password: '',
  reconnectPeriod: 1000,
})

const topic = 'aiqube/#'

function parseF(str) {
  var float = 0, sign ,exp, int = 0;
      
  int = parseInt(str,16);

  sign = (int>>>31)?-1:1;
  exp = (int >>> 23 & 0xff) - 127;
  mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
  for (i=0; i<mantissa.length; i+=1){
    float += parseInt(mantissa[i])? Math.pow(2,exp):0;
    exp--;
  }
  return float*sign;
}

function processValue(bytes) {
  value = bytes.slice(0, 16);
  value = value.split('').reverse().join('')
  for (let i = 0; i < value.length; i += 2) {
    value = value.slice(0, i) + value[i + 1] + value[i] + value.slice(i + 2);
  }
  return parseF(value);
}

client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
})

client.on('error', (error) => {
  console.error('connection failed', error)
})

client.on('message', (topic, payload) => {
  received_data = payload.toString();
  console.log('Received Message:', topic, received_data);
  received_data = received_data.slice(16);
  
  latitude = processValue(received_data.slice(0, 8));
  longitude = processValue(received_data.slice(8, 16));

  console.log('Latitude:', latitude);
  console.log('Longitude:', longitude);
})

// // Disconnect
// client.end()

// // Force disconnect
// client.end(true)

// // Callback for disconnection
// client.end(false, {}, () => {
//   console.log('client disconnected')
// })