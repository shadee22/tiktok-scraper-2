"use client";

import { useState } from "react";
import { ClipLoader } from "react-spinners";

interface Video {
    video: {
        duration: number;
        height: number;
        bit_rate: { play_addr: { url_list: string[] } }[];
    };
}

interface TikTokApiResponse {
    data: {
        data: Video[];
        nextCursor?: number;
    };
}

export default function Home() {
    const [hashtag, setHashtag] = useState<string>("nopole");
    const [cursor, setCursor] = useState<number>(0);
    const [videos, setVideos] = useState<Video[]>([]);
    const [status, setStatus] = useState<string>("Click 'Fetch Data' to load the API response...");
    const [showLoadMore, setShowLoadMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchTikTokLinks = async (isLoadMore = false) => {
        if (!hashtag.trim()) {
            setStatus("Please enter a valid hashtag.");
            return;
        }

        setLoading(true);
        if (!isLoadMore) setShowLoadMore(false); // Hide "Load More" for new searches
        setStatus("Fetching data...");
        const apiUrl = `/api/tiktok?name=${hashtag}&cursor=${cursor}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: TikTokApiResponse = await response.json();

            // Filter videos based on criteria
            const filteredPosts =
                hashtag === "nopole"
                    ? data.data.data.filter(
                          (post) => post.video.duration < 18000 && post.video.height === 1024
                      )
                    : data.data.data.filter((post) => post.video.height === 1024);

            if (filteredPosts.length > 0) {
                setVideos(isLoadMore ? [...videos, ...filteredPosts] : filteredPosts);
                setStatus("Data fetched successfully!");

                // Update cursor for the next fetch
                if (data.data.nextCursor !== undefined) {
                    setCursor(data.data.nextCursor);
                    setShowLoadMore(true); // Show "Load More" only after data is loaded
                } else {
                    setShowLoadMore(false);
                }
            } else {
                setStatus("No posts found with the specified criteria.");
                setShowLoadMore(false);
            }
        } catch (error: any) {
            console.error("Error fetching TikTok videos:", error.message);
            setStatus("Error fetching data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                    Dumb Tiktok Scraper
                </h1>

                {/* Hashtag Input Field */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <label htmlFor="hashtagInput" className="text-gray-700 sm:mr-4 w-full sm:w-auto">
                        Enter Hashtag:
                    </label>
                    <input
                        id="hashtagInput"
                        value={hashtag}
                        onChange={(e) => setHashtag(e.target.value)}
                        placeholder="e.g., arcane"
                        className="flex-1 border border-gray-300 rounded px-4 py-2 text-gray-700"
                    />
                    <button
                        onClick={() => {
                            setVideos([]);
                            setCursor(0);
                            fetchTikTokLinks();
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                    >
                        {loading && cursor === 0 && <ClipLoader size={18} color="white" />}
                        {!loading || cursor > 0 ? "Fetch Data" : ""}
                    </button>
                </div>

                {/* Status Message */}
                <p className="text-gray-600 mb-4 text-center">{status}</p>

                {/* Videos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((post, index) => (
                        <div
                            key={index}
                            className="bg-white shadow rounded-md flex flex-col items-center"
                        >
                            <video
                                controls
                                className="w-full h-auto rounded-lg"
                            >
                                <source
                                    src={post.video.bit_rate[0].play_addr.url_list[0]}
                                    type="video/mp4"
                                />
                            </video>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                {showLoadMore && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => fetchTikTokLinks(true)}
                            className="w-full sm:w-auto px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <ClipLoader size={20} color="white" />
                            ) : (
                                "Load More"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
