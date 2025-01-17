import { EmptyContent } from "components/EmptyContent";
import { KeyValueItem, KeyValueItemListWithNewCreateState } from "components/KeyValueItemList";
import { ActionSelectorControl } from "comps/controls/actionSelector/actionSelectorControl";
import CompNameControl from "comps/controls/compNameControl";
import { list } from "comps/generators/list";
import { NameGenerator } from "comps/utils";
import { Section, TacoButton } from "openblocks-design";
import { trans } from "i18n";
import { ModuleMethodListItemComp, WithParamsActionControl } from "./moduleMethodListItemComp";
import { ConfigViewSection } from "./styled";
import ModuleMethodParamListComp from "./moduleMethodParamListComp";
import styled from "styled-components";
import { GreyTextColor } from "constants/style";

const MethodName = styled.div`
  color: ${GreyTextColor};
`;

const ModuleMethodListCompBase = list(ModuleMethodListItemComp);

class ModuleMethodListComp extends ModuleMethodListCompBase {
  nameGen = new NameGenerator();

  names() {
    return this.getView().map((i) => i.children.name.getView());
  }

  handleAdd() {
    const name = this.nameGen.init(this.names()).genItemName("method");
    this.dispatch(
      this.pushAction({
        name,
      })
    );
  }

  handleDelete(idx: number) {
    this.dispatch(this.deleteAction(idx));
  }

  async executeMethodByName(name: string, params: any) {
    const method = this.getView().find((i) => i.children.name.getView() === name);
    if (!method) {
      return;
    }
    return method.execute(params);
  }

  getTestView() {
    const methodTriggers = this.getView().map((i) => {
      const name = i.children.name.getView();

      const handleExecute = () => {
        const params = i.children.params.getParams();
        this.executeMethodByName(name, params);
      };

      return (
        <>
          <MethodName>{name}</MethodName>
          {i.children.params.getTestView()}
          <TacoButton buttonType="blue" key={name} onClick={() => handleExecute()}>
            {trans("module.excuteMethod", { name: name })}
          </TacoButton>
        </>
      );
    });
    return (
      <Section name={trans("moduleContainer.methodTest")}>
        {methodTriggers.length > 0 ? (
          methodTriggers
        ) : (
          <EmptyContent text={trans("module.emptyTestMethod")} />
        )}
      </Section>
    );
  }

  getPropertyView() {
    const children = this.getView();
    return (
      <ConfigViewSection>
        <PropertyView
          onAdd={() => this.handleAdd()}
          onDelete={(i) => this.handleDelete(i)}
          items={children}
        />
      </ConfigViewSection>
    );
  }
}

export default ModuleMethodListComp;

interface PropertyViewProps {
  onAdd: () => void;
  onDelete: (idx: number) => void;
  items: InstanceType<typeof ModuleMethodListItemComp>[];
}

function PropertyView(props: PropertyViewProps) {
  const { onDelete, onAdd, items } = props;

  return (
    <div>
      <KeyValueItemListWithNewCreateState
        title={trans("module.method")}
        keyTitle={trans("module.name")}
        valueTitle={trans("module.action")}
        onAdd={onAdd}
        emptyText={trans("module.emptyMethod")}
      >
        {(newCreateIdx) =>
          items.map((i, idx) => (
            <MethodItem
              key={idx}
              {...i.children}
              onDelete={() => onDelete(idx)}
              showPopover={idx === newCreateIdx}
            />
          ))
        }
      </KeyValueItemListWithNewCreateState>
    </div>
  );
}

interface MethodItemProps {
  name: InstanceType<typeof CompNameControl>;
  params: InstanceType<typeof ModuleMethodParamListComp>;
  action: InstanceType<typeof ActionSelectorControl>;
  onDelete: () => void;
  showPopover: boolean;
}

function MethodItem(props: MethodItemProps) {
  const { name, action, params, onDelete } = props;

  const handleOnParamsConfigChange = () => {
    action.dispatch(WithParamsActionControl.changeParamDataAction(params.getParamsData()));
  };

  const content = (
    <>
      {name.propertyView({ label: trans("module.name") })}
      {params.propertyView({ onParamsConfigChange: handleOnParamsConfigChange })}
      {action.propertyView({ label: trans("module.action") })}
    </>
  );

  return (
    <KeyValueItem
      del={onDelete}
      name={name.getView()}
      value={action.displayName()}
      clickPopoverContent={content}
      defaultShowPopover={props.showPopover}
    />
  );
}
