import { IngredientUnit, Instruction } from '@prisma/client';
import SmartInstruction from 'components/common/SmartInstruction';
import EquipmentTooltip from 'components/common/tooltip/EquipmentTooltip';
import IngredientTooltip from 'components/common/tooltip/IngredientTooltip';
import TemperatureTooltip from 'components/common/tooltip/TemperatureTooltip';
import TextWithTooltip from 'components/common/tooltip/TextWithTooltip';
import MeasurementPopover from 'components/popover/MeasurementPopover';
import TextWithPopover from 'components/popover/TextWithPopover';
import { genId } from 'lib/util-client';
import React from 'react';
import { EquipmentWithAll, IngredientWithAll } from 'types/models';

function createUnitMap(allUnits: IngredientUnit[]) {
  const unitAbbreviations = allUnits.map((u) => u.abbreviation);
  const unitPlurals = allUnits.map((u) => u.plural);
  const unitsMap = new Map<string, IngredientUnit>();
  allUnits.forEach((u) => {
    unitsMap.set(u.unit, u);
  });
  unitAbbreviations.forEach((a) => {
    const unit = allUnits.find((u) => u.abbreviation === a);
    if (!unit) return;
    unitsMap.set(a, unit);
  });
  unitPlurals.forEach((p) => {
    const unit = allUnits.find((u) => u.plural === p);
    if (!unit) return;
    unitsMap.set(p, unit);
  });

  console.log('unitsMap', unitsMap);

  return unitsMap;
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
  const unitsMap = createUnitMap(allUnits);

  const smartInstructions = instructions.map((i) => (
    <div key={i.id} className="w-5/6 rounded-md bg-smoke px-2 py-1">
      <SmartInstruction
        allUnits={allUnits}
        unitsMap={unitsMap}
        description={i.description}
        tags={[...ingredients, ...equipment]}
        ingredientTooltipComponent={(ingredient) => (
          <TextWithTooltip
            key={`${ingredient.id}${genId()}`}
            text={ingredient.name.name}
            tooltipElement={<IngredientTooltip ingredient={ingredient} />}
          />
        )}
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
            text={measurement.segment.quantity + measurement.segment.text}
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
