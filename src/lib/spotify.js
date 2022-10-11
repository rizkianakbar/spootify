import config from "../config";

const { authUrl, clientId, clientSecret, refresh_token, baseUrl } = config.api;

const getAccessToken = async () => {
  const basic = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(authUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  return response.json();
};

export const fetchAllData = async () => {
  const { access_token } = await getAccessToken();

  const headers = new Headers({
    Authorization: "Bearer " + access_token,
  });

  const promise = [
    fetch(`${baseUrl}/new-releases`, { headers }).then((res) => res.json()),
    fetch(`${baseUrl}/featured-playlists`, { headers }).then((res) =>
      res.json()
    ),
    fetch(`${baseUrl}/categories`, { headers }).then((res) => res.json()),
  ];

  const [newReleases, playlists, categories] = await Promise.allSettled(
    promise
  );

  if (
    newReleases.status === "fulfilled" &&
    playlists.status === "fulfilled" &&
    categories.status === "fulfilled"
  ) {
    return {
      newReleases: newReleases?.value?.albums?.items || [],
      playlists: playlists?.value?.playlists?.items || [],
      categories: categories?.value?.categories?.items || [],
    };
  }
};
