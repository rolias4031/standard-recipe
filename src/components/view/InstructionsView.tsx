import { IngredientUnit, Instruction } from '@prisma/client';
import SmartInstruction, {
  SmartInstructionWrapper,
} from 'components/common/SmartInstruction';
import { genId } from 'lib/util-client';
import React, { ReactNode, useMemo } from 'react';
import { EquipmentWithAll, IngredientWithAll } from 'types/models';
import { useDissectUnitStructures } from 'lib/parsing/utils';
import ViewSectionContainer from './ViewSectionContainer';
import TextWithDialog from 'components/common/dialog/TextWithDialog';
import IngredientDialog from 'components/common/dialog/IngredientDialog';
import EquipmentDialog from 'components/common/dialog/EquipmentDialog';
import MeasurementDialog from 'components/common/dialog/MeasurementDialog';
import TemperatureDialog from 'components/common/dialog/TemperatureDialog';

function hasEquipmentDialogContent(equipment: EquipmentWithAll) {
  const hasSomething = !!(
    equipment.notes ||
    equipment.optional ||
    equipment.substitutes.length > 0
  );
  return hasSomething;
}

function hasIngredientDialogContent(ingredient: IngredientWithAll) {
  const hasSomething = !!(
    ingredient.notes ||
    ingredient.optional ||
    ingredient.substitutes.length > 0 ||
    ingredient.unit ||
    ingredient.quantity
  );
  return hasSomething;
}

interface InstructionBlockProps {
  order: number;
  children: ReactNode;
  optional: boolean;
}

function InstructionBlock({
  order,
  optional,
  children,
}: InstructionBlockProps) {
  return (
    <SmartInstructionWrapper>
      <span className="text-md pr-1 font-mono text-concrete">{order}.</span>
      {optional ? (
        <span className="mr-2 rounded-lg text-concrete underline">
          optional
        </span>
      ) : null}
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
    <InstructionBlock order={i.order} optional={i.optional} key={i.id}>
      <SmartInstruction
        unitStringsForRegex={unitStrings.unitNamesAbbreviationsPlurals}
        unitMap={unitMap}
        description={i.description}
        items={ingredientsAndEquipment}
        ingredientTooltipComponent={(ingredient) => (
          <TextWithDialog
            disabled={!hasIngredientDialogContent(ingredient)}
            key={ingredient.id + genId()}
            text={ingredient.text}
            dialogContent={<IngredientDialog ingredient={ingredient} />}
          />
        )}
        equipmentTooltipComponent={(equipment) => (
          <TextWithDialog
            disabled={!hasEquipmentDialogContent(equipment)}
            key={equipment.id + genId()}
            text={equipment.text}
            dialogContent={<EquipmentDialog equipment={equipment} />}
          />
        )}
        measurementPopoverComponent={(measurement) => (
          <TextWithDialog
            disabled={measurement.property === 'other'}
            key={measurement.quantity + measurement.id + genId()}
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
          <TextWithDialog
            key={temp.temperature + temp.unit + genId()}
            text={temp.text}
            styles={{ text: 'text-indigo-500' }}
            dialogContent={
              <TemperatureDialog
                temperature={temp.temperature}
                unit={temp.unit}
              />
            }
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
