export function getSectionIndexByTitle(title: string): number {
  const sectionTitles = ['Dashboard', 'Users', 'Tokens', 'Logs'];
  return sectionTitles.indexOf(title);
}

export function getSwitchIndexByLabel(title: string, label: string): number {
  const sections = [
    {
      title: 'Dashboard',
      switches: [
        { label: 'Requests' },
        { label: 'Tokens' },
        { label: 'Banned' },
        { label: 'Roles' },
        { label: 'Country' },
      ],
    },
    {
      title: 'Users',
      switches: [
        { label: 'Username' },
        { label: 'Email' },
        { label: 'Registration' },
        { label: 'Modal' },
        { label: 'Modal: Token' },
      ],
    },
    {
      title: 'Tokens',
      switches: [
        { label: 'Token' },
        { label: 'Expirations' },
        { label: 'User ID' },
        { label: 'Modal' },
        { label: 'Actions' },
      ],
    },
    {
      title: 'Logs',
      switches: [
        { label: 'Timestamp' },
        { label: 'Duration' },
        { label: 'Request' },
        { label: 'User ID' },
        { label: 'Modal' },
      ],
    },
  ];

  const section = sections.find((s) => s.title === title);

  if (section) {
    const switchIndex = section.switches.findIndex((s) => s.label === label);

    return switchIndex;
  }

  return -1;
}
