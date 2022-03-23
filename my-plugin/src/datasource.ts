import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {

    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    const data = options.targets.map(target => {
        
        const query = defaults(target, defaultQuery);

        interface NetdataAPIResponse {
            labels: [string]
            data: [[]]
        }
        
        async function getData(): Promise<NetdataAPIResponse[]> {
            
            const value = await fetch('https://london.my-netdata.io/api/v1/data?chart=system.ip&format=json&points=10')
            .then(res => res.json())
            .then(res => {return res as NetdataAPIResponse[]})
            return value;
        }
        const data = await getData()
      
        var fields = []
        //var fields = [
        //    { name: 'Time', values: [
        //        data.data.map(function(value,index) { return value[0]
        //        ], type: FieldType.time },
        //]
        //var fields = [{ name: 'Time', values: [from, to], type: FieldType.time }]
        fields.push({ name: 'Time', values: data.data.map(function(value,index) { return value[0] }), type: FieldType.time })

        for (var i = 0; i < data.labels.length; i++) {
            fields.push({ name: data.labels[i], values: data.data.map(function(value,index) { return value[i] }), type: FieldType.number })
        }

      return new MutableDataFrame({
        refId: query.refId,
        fields: fields
      });
      
    });

    return { data };
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
