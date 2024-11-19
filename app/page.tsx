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
    const [selectedHashtag, setSelectedHashtag] = useState<string>("nopole");
    const [cursor, setCursor] = useState<number>(0);
    const [videos, setVideos] = useState<Video[]>([]);
    const [status, setStatus] = useState<string>("Click 'Fetch Data' to load the API response...");
    const [showLoadMore, setShowLoadMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchTikTokLinks = async (isLoadMore = false) => {
        setLoading(true);
        setStatus("Fetching data...");
        const apiUrl = `/api/tiktok?name=${selectedHashtag}&cursor=${cursor}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: TikTokApiResponse = await response.json();

            // Filter videos based on criteria
            const filteredPosts =
                selectedHashtag === "nopole"
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
                    setShowLoadMore(true);
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
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Dumb Tiktok Scraper</h1>

                {/* Hashtag Selector */}
                <div className="flex items-center mb-6">
                    <label htmlFor="hashtagSelector" className="text-gray-700 mr-4">
                        Choose something:
                    </label>
                    <select
                        id="hashtagSelector"
                        value={selectedHashtag}
                        onChange={(e) => setSelectedHashtag(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 text-gray-700"
                    >
                        <option value="nopole">nopole</option>
                        <option value="itsokimok">itsokimok</option>
                        <option value="arcane">arcane</option>
                        <option value="games">pubg</option>
                        <option value="badgirlslikeyou">bad girls like you</option>
                    </select>
                    <button
                        onClick={() => {
                            setVideos([]);
                            setCursor(0);
                            fetchTikTokLinks();
                        }}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                    >
                        {loading && cursor === 0 && <ClipLoader size={18} color="white" />}
                        {!loading || cursor > 0 ? "Fetch Data" : ""}
                    </button>
                </div>

                {/* Status Message */}
                <p className="text-gray-600 mb-4">{status}</p>

                {/* Videos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((post, index) => (
                        <div
                            key={index}
                            className="bg-white shadow  flex flex-col items-center"
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
                            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
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
