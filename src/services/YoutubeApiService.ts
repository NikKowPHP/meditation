export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

class YoutubeApiService {
  private apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  async searchVideos(query: string): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query + ' meditation',
      )}&type=video&maxResults=10&key=${this.apiKey}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch videos from YouTube');
    }

    const data = await response.json();

    return data.items.map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          description: string;
          thumbnails: { medium: { url: string } };
        };
      }) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
      }),
    );
  }
}

export const youtubeApiService = new YoutubeApiService();
export default youtubeApiService;
