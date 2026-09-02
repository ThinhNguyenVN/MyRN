# todo (example feature)

This is a reference implementation of the list/form screen pattern from `.docs/screen-standard.md`
(`container` + `view` + `types` + `styles` + `use-<screen>`, RTK Query via `todo-api.ts`), not a
real product feature. Safe to delete when starting a new product from this kit — keep the
pattern it demonstrates, not the todo domain itself.

## To remove it

1. Delete this folder (`src/features/todo/`) and its routes: `src/app/(private)/todo/`.
2. Remove `Routes.todo` / `Routes.todoForm` from `src/constants/routes.ts`.
3. Remove the `todoApi` reducer/middleware registration in `src/store/store.ts`.
4. Remove the `todo.*` key block from `src/i18n/resources/en.json` and `vi.json`.
5. Remove the links to it: the "go to todo" button in
   `src/features/home/screens/home-screen.container.tsx` (`home.goTodo`), and the add-todo
   header button in `src/app/(private)/_layout.tsx`.

`src/features/auth/` is not an example — it's real, reusable auth infrastructure. Keep it.
