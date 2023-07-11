import { IngredientUnit, Instruction } from '@prisma/client';
import SmartInstruction, {
  SmartInstructionWrapper,
} from 'components/common/SmartInstruction';
import TemperatureTooltip from 'components/common/tooltip/TemperatureTooltip';
import TextWithTooltip from 'components/common/tooltip/TextWithTooltip';
import TextWithPopover from 'components/common/popover/TextWithPopover';
import { genId } from 'lib/util-client';
import React, { ReactNode, useMemo } from 'react';
import { EquipmentWithAll, IngredientWithAll } from 'types/models';
import { useDissectUnitStructures } from 'lib/parsing/utils';
import ViewSectionContainer from './ViewSectionContainer';
import TextWithDialog from 'components/common/dialog/TextWithDialog';
import IngredientDialog from 'components/common/dialog/IngredientDialog';
import EquipmentDialog from 'components/common/dialog/EquipmentDialog';
import MeasurementDialog from 'components/common/dialog/MeasurementDialog';

interface InstructionBlockProps {
  order: number;
  children: ReactNode;
}

function InstructionBlock({ order, children }: InstructionBlockProps) {
  return (
    <SmartInstructionWrapper>
      <span className="text-md pr-1 font-mono text-concrete">{order}.</span>
      {children}
    </SmartInstructionWrapper>
  );
}
interface InstructionsViewProps {
  instructions: Instruction[];
  ingredients: IngredientWithAll[];
  equipment: EquipmentWithAll[];
  allUnits: IngredientUnit[];
}

function InstructionsView({
  instructions,
  ingredients,
  equipment,
  allUnits,
}: InstructionsViewProps) {
  const { unitMap, unitStrings, unitsByProperty } =
    useDissectUnitStructures(allUnits);

  const ingredientsAndEquipment = useMemo(
    () => [...ingredients, ...equipment],
    [ingredients, equipment],
  );

  const instructionViewRows = instructions.map((i) => (
    <InstructionBlock order={i.order} key={i.id}>
      <SmartInstruction
        unitStringsForRegex={unitStrings.unitNamesAbbreviationsPlurals}
        unitMap={unitMap}
        description={i.description}
        items={ingredientsAndEquipment}
        ingredientTooltipComponent={(ingredient) => (
          <TextWithDialog
            text={ingredient.name.name}
            dialogContent={<IngredientDialog ingredient={ingredient} />}
          />
        )}
        equipmentTooltipComponent={(equipment) => (
          <TextWithDialog
            key={`${equipment.id}${genId()}`}
            text={equipment.name.name}
            dialogContent={<EquipmentDialog equipment={equipment} />}
          />
        )}
        measurementPopoverComponent={(measurement) => (
          <TextWithDialog
            disabled={measurement.property === 'other'}
            key={measurement.quantity + measurement.id}
            text={measurement.text}
            styles={{ text: 'text-indigo-500' }}
            dialogContent={
              <MeasurementDialog
                measurement={measurement}
                propertyUnits={
                  measurement.property === 'mass' ||
                  measurement.property === 'weight'
                    ? unitsByProperty['mass']?.concat(
                        unitsByProperty['weight'] ?? [],
                      )
                    : unitsByProperty[measurement.property]
                }
              />
            }
          />
        )}
        temperatureTooltipComponent={(temp) => (
          <TextWithTooltip
            key={temp.temperature + temp.unit}
            text={temp.text}
            styles={{ text: 'font-semibold' }}
            tooltipElement={<TemperatureTooltip temp={temp} />}
          />
        )}
      />
    </InstructionBlock>
  ));

  return (
    <ViewSectionContainer
      title="Instructions"
      totalItems={instructionViewRows.length}
    >
      <div className="flex flex-col space-y-5">{instructionViewRows}</div>
    </ViewSectionContainer>
  );
}

export default InstructionsView;
