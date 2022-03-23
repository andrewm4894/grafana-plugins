import fetch from "node-fetch";
import {
    DataQueryRequest,
    DataQueryResponse,
    DataSourceApi,
    DataSourceInstanceSettings,
    MutableDataFrame,
    FieldType,
  } from '@grafana/data';

let message: string = 'Hello World!';
console.log(message);

interface NetdataAPIResponse {
    labels: [string]
    data: [[]]
}

async function getData(): Promise<NetdataAPIResponse[]> {
    
    const value = await fetch('https://london.my-netdata.io/api/v1/data?chart=system.ip&format=json')
    .then(res => res.json())
    .then(res => {
            return res as NetdataAPIResponse[]
    })
    return value;
}
const data = await getData()
console.log(data)

console.log(new MutableDataFrame({
    refId: '111',
    fields: [
        { name: 'Time', values: [10,100], type: FieldType.time },
        { name: 'dimx', values: [Math.random(), Math.random()], type: FieldType.number }
    ]
  }))

console.log(data.data.map(function(value,index) { return value[0] }))
console.log(data.labels.length)

for (var i = 0; i < data.labels.length; i++) {
    console.log(data.data.map(function(value,index) { return value[i] }))
}