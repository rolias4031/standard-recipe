import { Recipe } from '@prisma/client';
import React from 'react';

interface ViewModeRouterProps {
  status: Recipe['status'];
  publishedView: JSX.Element;
  draftView: JSX.Element;
}

function ViewModeRouter({
  status,
  draftView,
  publishedView,
}: ViewModeRouterProps) {
  if (status === 'draft') {
    return draftView;
  }
  if (status === 'published') {
    return publishedView;
  }
  return <div>Recipe archived</div>;
}

export default ViewModeRouter;
