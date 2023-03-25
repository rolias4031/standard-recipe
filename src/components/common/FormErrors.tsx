import React from 'react'
import { ValidationPayload } from 'types/types';

interface FormErrorsProps {
  validation: Record<string, ValidationPayload>
}

function FormErrors({ validation }: FormErrorsProps) {
  console.log(validation);
  return (
    <>{`${validation.name?.isInvalid}`}</>
  )
}

export default FormErrors