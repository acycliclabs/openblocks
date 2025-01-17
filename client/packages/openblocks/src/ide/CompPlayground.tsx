import React, { useState, useMemo, ChangeEvent } from "react";
import ReactJson from "react-json-view";
import { UICompLayoutInfo } from "comps/uiCompRegistry";
import { Comp, customAction } from "openblocks-core";
import { Button, Space, Input, Form } from "antd";
import styled from "styled-components";
import { useCompInstance, GetContainerParams } from "comps/utils/useCompInstance";
import { CanvasContainerID } from "constants/domLocators";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  height: 100%;

  .help {
    font-size: 12px;
    color: #b8b9bf;
  }

  .panel {
    display: flex;
    flex-direction: column;

    .panel-title {
      font-size: 12px;
      padding: 4px 8px;
      border-bottom: 1px solid #efefef;
    }

    .panel-content {
      flex: 1;
      overflow: auto;
    }
  }

  .data-panel {
    width: 312px;
    border-right: 1px solid #efefef;

    .panel-content {
      padding: 8px;
    }
  }

  .property-panel {
    height: 100%;
    width: 312px;
    border-left: 1px solid #efefef;
    box-sizing: border-box;
  }

  .preview-panel {
    flex: 1;
    display: flex;

    .preview-content {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f6;
    }
  }

  .bottom-panel {
    position: relative;
    height: 180px;
    border-top: 1px solid #efefef;

    .panel-content {
      padding: 8px;
    }

    .ant-form-item {
      margin-bottom: 16px;
    }

    .ant-form-item-label {
      & > label {
        font-size: 12px;
        height: 28px;
      }
    }

    .ant-form-item-control-input {
      min-height: 28px;
    }

    .ant-form-item-explain {
      font-size: 12px;
    }
  }

  .main {
    display: flex;
    flex-direction: row;
    flex: 1;
    background-color: #fff;
    overflow: hidden;
  }
`;

interface IProps {
  compFactory: Comp<any>;
  layoutInfo: UICompLayoutInfo;
}

export function CompPlayground(props: IProps) {
  const { compFactory, layoutInfo } = props;
  const [methodParams, setMethodParams] = useState<string[]>([]);

  const handleChangeMethodParams = (e: ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const v = JSON.parse(e.target.value);
      if (Array.isArray(v)) {
        setMethodParams(v);
        return;
      }
      setMethodParams([v]);
    } catch {
      setMethodParams([]);
    }
  };

  const containerParams: GetContainerParams<any> = useMemo(
    () => ({
      Comp: compFactory,
      initialValue: {},
    }),
    [compFactory]
  );
  const [comp] = useCompInstance(containerParams);

  if (!comp) {
    return null;
  }

  const methods = Object.keys(comp.exposingInfo?.().methods || {});
  return (
    <Container>
      <div className="main">
        <div className="panel data-panel">
          <div className="panel-title">Data</div>
          <div className="panel-content">
            <ReactJson
              collapsed={2}
              enableClipboard={false}
              src={comp.exposingValues}
              name={false}
              displayDataTypes={false}
              indentWidth={2}
              iconStyle="square"
            />
          </div>
        </div>
        <div className="panel preview-panel">
          <div className="panel-title">Preview</div>
          <div
            className="preview-content"
            id={CanvasContainerID}
            style={{ overflow: "auto", contain: "paint" }}
          >
            <div style={{ width: layoutInfo.w * 48, height: layoutInfo.h * 8 }}>
              {comp.getView()}
            </div>
          </div>
        </div>
        <div className="panel property-panel">
          <div className="panel-title">Property</div>
          <div className="panel-content">{comp.getPropertyView()}</div>
        </div>
      </div>
      <div className="panel bottom-panel">
        <div className="panel-title">Console</div>
        <div className="panel-content">
          <Form component={false} layout="horizontal">
            <Form.Item label="Execute Methods">
              <Space>
                {methods.length === 0 && <div className="help">No methods.</div>}
                {methods.map((i) => (
                  <Button
                    key={i}
                    size="small"
                    onClick={() => {
                      comp.dispatch(
                        customAction({
                          type: "execute",
                          methodName: i,
                          params: methodParams,
                        })
                      );
                    }}
                  >
                    {i}
                  </Button>
                ))}
              </Space>
            </Form.Item>
            {methods.length > 0 && (
              <Form.Item
                label="Method Params"
                help="Input method params use JSON, for example, you can set setValue's params with: [1] or 1"
              >
                <Input.TextArea onChange={(params) => handleChangeMethodParams(params)} />
              </Form.Item>
            )}
          </Form>
        </div>
      </div>
    </Container>
  );
}
