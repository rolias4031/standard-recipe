import { Recipe } from '@prisma/client'
import React from 'react'
import RecipeInfoSection from './RecipeInfoSection'

interface InfoStageProps {
  recipe: Recipe
}

function InfoStage({ recipe }: InfoStageProps) {
  return (
    <div className="p-5 w-full flex flex-col">
    <RecipeInfoSection recipe={recipe} />
    <section></section>
  </div>
  )
}

export default InfoStage