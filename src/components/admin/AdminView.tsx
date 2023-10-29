import { Recipe } from '@prisma/client';
import React from 'react';
import { AppRecipesAndUsersQueryPayload } from 'types/types';

interface AdminViewProps extends AppRecipesAndUsersQueryPayload {}

function AdminView({ appRecipes, appUsers }: AdminViewProps) {
  const recipesGroupedByUser: Record<string, Recipe[]> = {};
  appUsers.forEach((u) => {
    const usersRecipes = appRecipes.filter((r) => r.authorId === u.id);
    recipesGroupedByUser[u.id] = usersRecipes;
  });

  const recipes = appRecipes.map((r) => (
    <div key={r.name} className="flex flex-col space-y-1 rounded-lg border p-2">
      <span>{r.name}</span>
      <span>{r.id}</span>
    </div>
  ));

  return (
    <div className="p-5">
      <div className="flex flex-col space-y-3">
        {appUsers.map((u) => {
          return (
            <div key={u.id}>
              <p>{u.id}</p>
              {recipesGroupedByUser[u.id]
                ? recipesGroupedByUser[u.id]?.map((r) => (
                    <div key={r.id}>{r.name}</div>
                  ))
                : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminView;
