import { ISchema, SchemaOptionsContext, useField, useFieldSchema, useForm } from '@formily/react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APIClientProvider,
  FormProvider,
  GeneralSchemaDesigner,
  SchemaComponent,
  SchemaComponentOptions,
  SchemaSettings,
  useAPIClient,
  useCompile,
  useDesignable,
} from '@nocobase/client';
import { FormDialog, FormLayout } from '@formily/antd';
import { Options } from './ChartBlockInitializer';
import { templates } from './templates';
import { css } from '@emotion/css';
import JSON5 from 'json5';
import DataSetPreviewTable from './DataSetPreviewTable';
import { Button } from 'antd';
import { parseDataSetString } from './utils';
import { ChartBlockEngineMetaData } from './ChartBlockEngine';

const validateJSON = {
  validator: `{{(value, rule)=> {
    if (!value) {
      return '';
    }
    try {
      const val = JSON.parse(value);
      if(!isNaN(val)) {
        return false;
      }
      return true;
    } catch(error) {
      console.error(error);
      return false;
    }
  }}}`,
  message: '{{t("Invalid JSON format")}}',
};

export const ChartBlockEngineDesigner = () => {
  const fieldSchema = useFieldSchema();
  const { chartBlockEngineMetaData } = fieldSchema?.['x-component-props'];
  return (
    <GeneralSchemaDesigner>
      <ChartBlockEngineDesignerInitializer
        chartBlockEngineMetaData={chartBlockEngineMetaData}
      />
      <SchemaSettings.Divider />
      <SchemaSettings.Remove
        removeParentsIfNoChildren
        breakRemoveOn={{
          'x-component': 'Grid',
        }}
      />
    </GeneralSchemaDesigner>
  );
};

export const ChartBlockEngineDesignerInitializer = (props) => {
    const { chartBlockEngineMetaData }: { chartBlockEngineMetaData: ChartBlockEngineMetaData } = props;
    const { t } = useTranslation();
    const options = useContext(SchemaOptionsContext);
    const { dn } = useDesignable();
    const fieldSchema = useFieldSchema();
    const api = useAPIClient();
    const field = useField();
    const compiler = useCompile();
    const { chartConfig, chartQueryMetadata } = chartBlockEngineMetaData;
    const dataSource = chartBlockEngineMetaData.chartQueryMetadata?.fields.map(field => {
      return {
        label: field.name,
        value: field.name,
      };
    });
    return (
      <SchemaSettings.Item
        onClick={async () => {
          FormDialog({ title: 'Edit chart block', width: 1200 }, (form) => {
            const [chartBlockEngineMetaData, setChartBlockEngineMetaData] = useState<ChartBlockEngineMetaData>(null);
            useEffect(() => {
              const chartBlockEngineMetaData = {
                chartQueryMetadata,
                chartConfig: form.values,
              };
              setChartBlockEngineMetaData(chartBlockEngineMetaData);
            }, [form.values.chartType]);
            return (
              <APIClientProvider apiClient={api}>
                <SchemaComponentOptions
                  scope={options.scope}
                  components={{ ...options.components }}
                >
                  <section className={
                    css`
                      display: flex;
                      gap: 16px;
                    `
                  }>
                    {/*  left*/}
                    <div className={
                      css`
                        flex: 1;
                        min-width: 600px;
                      `
                    }>
                      <FormProvider form={form}>
                        <FormLayout layout={'vertical'}>
                          <SchemaComponent
                            scope={{ dataSource, JSON5 }}
                            components={{ Options }}
                            schema={{
                              properties: {
                                chartType: {
                                  title: t('Chart type'),
                                  required: true,
                                  'x-component': 'CustomSelect',
                                  'x-decorator': 'FormItem',
                                  enum: [...templates.values()].map((template) => {
                                    return {
                                      label: template.title,
                                      value: template.type,
                                      group: template.group,
                                    };
                                  }),
                                },
                                options: {
                                  type: 'void',
                                  'x-component': 'Options',
                                },
                              },
                            }}
                          />
                        </FormLayout>
                      </FormProvider>
                    </div>
                    {/*  right*/}
                    <div className={
                      css`
                        flex: 1
                      `
                    }>
                      {/*DataSet Preview*/}
                      <h4>QueryData Preview:</h4>
                      {
                        chartBlockEngineMetaData?.chartQueryMetadata?.id
                        &&
                        <DataSetPreviewTable queryId={chartBlockEngineMetaData?.chartQueryMetadata?.id} />
                      }
                      {/*<DataSetPreviewTable dataSet={dataSet} />*/}
                      <div className={
                        css`
                          display: flex;
                          gap: 10px;
                        `
                      }>
                        <h4>
                          Chart Preview:
                        </h4>
                      </div>
                      {/*  Chart Preview*/}
                      {
                        chartBlockEngineMetaData
                        &&
                        <>
                          <SchemaComponent
                            schema={{
                              properties: {
                                chartPreview: {
                                  type: 'void',
                                  'x-decorator': 'CardItem',
                                  'x-component': 'ChartBlockEngine',
                                  'x-component-props': {
                                    chartBlockEngineMetaData,
                                  },
                                },
                              },
                            }}
                          />
                        </>
                      }
                    </div>
                  </section>
                </SchemaComponentOptions>
              </APIClientProvider>
            );
          })
            .open({
              initialValues: chartConfig,//reset before chartBlockMetaData
            })
            .then((values) => {
              //patch updates
              values = {
                chartQueryMetadata,
                chartConfig: values,
              };
              field.componentProps.chartBlockEngineMetaData = values;
              fieldSchema['x-component-props'].chartBlockEngineMetaData = values;
              dn.emit('patch', {
                schema: {
                  'x-uid': fieldSchema['x-uid'],
                  'x-component-props': fieldSchema['x-component-props'],
                },
              });
              dn.refresh();
            });
        }}
      >
        {props.children || props.title || 'Edit chart block'}
      </SchemaSettings.Item>
    )
      ;
  }
;