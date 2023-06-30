import { IngredientUnit, Instruction } from '@prisma/client';
import SmartInstruction from 'components/common/SmartInstruction';
import EquipmentTooltip from 'components/common/tooltip/EquipmentTooltip';
import IngredientTooltip from 'components/common/tooltip/IngredientTooltip';
import TemperatureTooltip from 'components/common/tooltip/TemperatureTooltip';
import TextWithTooltip from 'components/common/tooltip/TextWithTooltip';
import MeasurementPopover from 'components/popover/MeasurementPopover';
import TextWithPopover from 'components/popover/TextWithPopover';
import { genId } from 'lib/util-client';
import React, { useMemo } from 'react';
import { EquipmentWithAll, IngredientWithAll } from 'types/models';
import { useUnitStructures } from 'lib/parsing/utils';
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
  const { unitMap, unitNamesAbbreviationsPlurals } =
    useUnitStructures(allUnits);

  const ingredientsAndEquipment = useMemo(
    () => [...ingredients, ...equipment],
    [ingredients, equipment],
  );

  const smartInstructions = instructions.map((i) => (
    <div key={i.id} className="w-5/6 rounded-md bg-smoke px-2 py-1">
      <SmartInstruction
        unitStringsForRegex={unitNamesAbbreviationsPlurals}
        unitMap={unitMap}
        description={i.description}
        items={ingredientsAndEquipment}
        ingredientTooltipComponent={(ingredient) => {
          console.log('ingredient', ingredient);
          return (
            <TextWithTooltip
              key={`${ingredient.id}${genId()}`}
              text={ingredient.name.name}
              tooltipElement={<IngredientTooltip ingredient={ingredient} />}
            />
          );
        }}
        equipmentTooltipComponent={(equipment) => (
          <TextWithTooltip
            key={`${equipment.id}${genId()}`}
            text={equipment.name.name}
            tooltipElement={<EquipmentTooltip equipment={equipment} />}
          />
        )}
        measurementPopoverComponent={(measurement) => (
          <TextWithPopover
            key={genId()}
            text={measurement.text}
            tooltip={<MeasurementPopover measurement={measurement} />}
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
    </div>
  ));

  return <div className="flex flex-col space-y-2">{smartInstructions}</div>;
}

export default InstructionsView;
