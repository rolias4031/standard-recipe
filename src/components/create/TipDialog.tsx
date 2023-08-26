import { pickStyles, stopRootDivPropagation } from 'lib/util-client';
import React, { ReactNode, useState } from 'react';

type TipMode = 'ingredients & equipment' | 'instructions';

const headerClass = 'text-xl text-concrete font-mono';
const subheaderClass = 'text-lg underline';

export function TipDialogCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 overflow-auto max-h-[90vh] rounded-t-2xl bg-white p-5 md:p-10"
      onClick={stopRootDivPropagation}
    >
      {children}
    </div>
  );
}

export function TipDialog() {
  const [curTip, setCurTip] = useState<TipMode>('ingredients & equipment');

  function changeTipHandler(val: TipMode) {
    return () => setCurTip(val);
  }

  function createButtonStyles(val: TipMode) {
    return pickStyles('p-2 rounded-lg basis-1/2', [
      curTip === val,
      'bg-fern text-white',
    ]);
  }
  return (
    <TipDialogCard>
      <div className="sticky top-0 mb-5 flex space-x-3 rounded-xl bg-white border border-fern font-mono md:text-lg">
        <button
          className={createButtonStyles('ingredients & equipment')}
          onClick={changeTipHandler('ingredients & equipment')}
        >
          Ingredients & Equipment
        </button>
        <button
          className={createButtonStyles('instructions')}
          onClick={changeTipHandler('instructions')}
        >
          Instructions
        </button>
      </div>
      {curTip === 'ingredients & equipment' ? (
        <IngredientAndEquipmentTip />
      ) : null}
      {curTip === 'instructions' ? <InstructionTip /> : null}
    </TipDialogCard>
  );
}

export function IngredientAndEquipmentTip() {
  return (
    <div className="flex flex-col space-y-3">
      <div className="">
        <h1 className={headerClass}>Naming</h1>
        <p>
          {
            "Stick to the simplest name for your ingredient or equipment by including only what's necessary for the recipe. Add extra info like brand names and specifiers in the notes (you'll see why in the instructions section)."
          }
        </p>
        <ul className="py-2 list-inside list-disc">
          <li className='list-item'>
            <s>Whole Foods</s> <span className="text-fern">rigatoni pasta</span>
          </li>
          <li>
            <s>organic, fresh squeezed</s>{' '}
            <span className="text-fern">apple juice</span>
          </li>
          <li>
            <s>a well-seasoned</s>{' '}
            <span className="text-fern">cast iron pan</span>
          </li>
        </ul>
      </div>
      <div>
        <h1 className={headerClass}>Options</h1>
        <p>
          {
            "Click an ingredient's number to add notes and substitutes, mark it as optional, or delete it."
          }
        </p>
      </div>
      <div>
        <h1 className={headerClass}>Order</h1>
        <p>Drag and drop an ingredient by the number to rearrange its order.</p>
      </div>
    </div>
  );
}

export function InstructionTip() {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col space-y-2">
        <div className="">
          <h1 className={headerClass}>Smart Instructions</h1>
          <p>
            {
              'Smart Instructions are the soul of your recipe. They enrich your recipe with info and utilities so that readers can focus on cooking. Standard Recipe adds Smart Instructions automatically so long as you follow some simple rules.'
            }
          </p>
        </div>
        <div className="flex flex-col space-y-1">
          <div>
            <h1 className={subheaderClass}>Ingredients and Equipment</h1>
            <ul className="list-inside list-disc">
              <li className="">
                Write ingredient and equipment names as you named them in their
                sections
              </li>
              <li className="list-item">
                Names are case <span className="italic">insensitive</span>
              </li>
            </ul>
          </div>
          <div>
            <h1 className={subheaderClass}>Measurements and Temperatures</h1>
            <ul className="list-inside list-disc">
              <li className="">
                Write measurements as any number followed by a measurement name,
                abbreviation, or plural. See our official measurement list to
                know exactly what will work.
              </li>
              <li className="">
                {
                  'Write temperatures as any number followed by either C, F, K, or R, with an optional space in between. (Celsius, Fahrenheit, Kelvin, Rankine).'
                }
              </li>
              <div className="mt-2 flex flex-col space-y-1 rounded-lg border p-3 text-sm">
                <div>
                  <span className="text-fern">Works:</span> 1 ounce, 12 oz, 8.5
                  ounces, 400C, 400 C, 235F
                </div>
                <div>
                  <span className="text-red-500">Does not work:</span> 1oz, 5
                  heaping tablespoons, 200 degrees C, 325 Fahrenheit
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>
      <div>
        <h1 className={headerClass}>Options</h1>
        <p>
          {
            "Click an instruction's number to add notes and substitutes, mark it as optional, or delete it."
          }
        </p>
      </div>
      <div>
        <h1 className={headerClass}>Order</h1>
        <p>
          Drag and drop an instruction by the number to rearrange its order.
        </p>
      </div>
    </div>
  );
}
