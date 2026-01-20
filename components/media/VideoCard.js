import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, Clock } from "lucide-react";

export default function VideoCard({
	video,
	size = "medium",
	showRating = true,
	showDuration = true,
	className = "",
}) {
	const [isHovered, setIsHovered] = useState(false);
	const [imageError, setImageError] = useState(false);

	const formatDuration = (seconds) => {
		if (!seconds) return "";
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	};

	const sizeClasses = {
		small: "w-32 h-48",
		medium: "w-44 h-64",
		large: "w-56 h-80",
		wide: "w-72 h-40",
	};

	const imageSize = sizeClasses[size] || sizeClasses.medium;

	return (
		<Link
			href={`/media/couch/${video._id}`}
			className={`group relative block rounded-lg overflow-hidden bg-muted ${imageSize} ${className}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Thumbnail */}
			{video.thumbnails?.poster && !imageError ? (
				<Image
					src={video.thumbnails.poster}
					alt={video.title}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					onError={() => setImageError(true)}
				/>
			) : (
				<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-black/50 flex items-center justify-center">
					<Play className="h-12 w-12 text-white/50" />
				</div>
			)}

			{/* Hover Overlay */}
			<div
				className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
					isHovered ? "opacity-100" : "opacity-0"
				}`}
			>
				{/* Preview animation on hover */}
				{isHovered && video.thumbnails?.preview && (
					<Image
						src={video.thumbnails.preview}
						alt=""
						fill
						className="object-cover"
						unoptimized
					/>
				)}
			</div>

			{/* Gradient overlay for text readability */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

			{/* Duration Badge */}
			{showDuration && video.duration && (
				<div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
					<Clock className="h-3 w-3" />
					{formatDuration(video.duration)}
				</div>
			)}

			{/* Content Type Badge */}
			{video.type && (
				<div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-medium px-2 py-0.5 rounded capitalize">
					{video.type}
				</div>
			)}

			{/* Bottom Info */}
			<div className="absolute bottom-0 left-0 right-0 p-3">
				<h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
					{video.title}
				</h3>

				<div className="flex items-center gap-2">
					{/* Rating */}
					{showRating && video.avgRating > 0 && (
						<div className="flex items-center gap-1">
							<Star className="h-3 w-3 text-yellow-500 fill-current" />
							<span className="text-white text-xs">
								{video.avgRating.toFixed(1)}
							</span>
						</div>
					)}

					{/* Year */}
					{video.releaseYear && (
						<span className="text-white/70 text-xs">{video.releaseYear}</span>
					)}

					{/* Sport Types */}
					{video.sportTypes?.length > 0 && (
						<span className="text-white/70 text-xs capitalize">
							{video.sportTypes[0]}
						</span>
					)}
				</div>
			</div>

			{/* Play Button on Hover */}
			<div
				className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
					isHovered ? "opacity-100" : "opacity-0"
				}`}
			>
				<div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
					<Play className="h-7 w-7 text-black ml-1" fill="currentColor" />
				</div>
			</div>
		</Link>
	);
}
