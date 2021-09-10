const clipPatterns = [
  // /^([A-Za-z0-9]+(?:-[A-Za-z0-9_-]{16})?)$/,
  /^https:\/\/clips.twitch.tv\/([A-Za-z0-9]+(?:-[A-Za-z0-9_-]{16})?)(\?.+)?$/,
  /^https:\/\/(www.)?twitch.tv\/\w+\/clip\/([A-Za-z0-9]+(?:-[A-Za-z0-9_-]{16})?)(\?.+)?$/,
]

export const getSlugFromUrl = (url: string): string | undefined => {
  let match;
  for (const pattern of clipPatterns) {
    const matchArr = url.match(pattern);
    if (matchArr) {
      match = matchArr;
      break;
    }
  }

  const pathnameMatch = parseClipSlugFromPath(url);
  const confirmedMatch = match?.find((regexpMatch) => regexpMatch === pathnameMatch);

  return confirmedMatch;
}

const parseClipSlugFromPath = (url: string) => {
  let slug;
  try {
    const u = new URL(url);
    const paths = u.pathname.split("/");
    slug = paths[paths.length - 1];
  } catch (error) {
    // in case the input is not valid url
  }
  return slug;
}
