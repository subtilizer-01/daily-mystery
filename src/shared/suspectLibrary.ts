export type LibraryCharacter = {
  id: string;
  name: string;
  imageUrl: string;
};

// The fixed roster of chibi portraits available to both the built-in daily
// cases and the community case-creation flow. `id` is stable (matches the
// image's library filename minus extension) so it's safe to persist in
// Redis and re-resolve to a name/image later.
export const SUSPECT_LIBRARY: LibraryCharacter[] = [
  { id: 'lady_red', name: 'Lady Ashcroft', imageUrl: '/suspects/lady_red.png' },
  { id: 'gardener', name: 'Old Fen', imageUrl: '/suspects/gardener.png' },
  { id: 'businessman_grey2', name: 'Mr. Vance', imageUrl: '/suspects/businessman_grey2.png' },
  { id: 'waiter', name: 'Andre', imageUrl: '/suspects/waiter.png' },
  { id: 'curator', name: 'Miss Quill', imageUrl: '/suspects/curator.png' },
  { id: 'aristocrat_fan', name: 'Mrs. Holt', imageUrl: '/suspects/aristocrat_fan.png' },
  { id: 'captain', name: 'Captain Mercer', imageUrl: '/suspects/captain.png' },
  { id: 'chef', name: 'Chef Marco', imageUrl: '/suspects/chef.png' },
  { id: 'librarian', name: 'Miss Dale', imageUrl: '/suspects/librarian.png' },
  { id: 'pickpocket', name: 'Rex Cole', imageUrl: '/suspects/pickpocket.png' },
  { id: 'professor', name: 'Prof. Ainsley', imageUrl: '/suspects/professor.png' },
  { id: 'security', name: 'Chief Groves', imageUrl: '/suspects/security.png' },
  { id: 'docworker', name: 'Rusty Doyle', imageUrl: '/suspects/docworker.png' },
  { id: 'goldrings_dealer', name: 'Silas Penn', imageUrl: '/suspects/goldrings_dealer.png' },
  { id: 'guard', name: 'Officer Bell', imageUrl: '/suspects/guard.png' },
];

export function findLibraryCharacter(id: string): LibraryCharacter | undefined {
  return SUSPECT_LIBRARY.find((character) => character.id === id);
}
