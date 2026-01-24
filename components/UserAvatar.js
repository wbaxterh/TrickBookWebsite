import Image from "next/image";
import { User } from "lucide-react";
import VerifiedBadge from "./ui/VerifiedBadge";

/**
 * User avatar component with TrickBook Plus verified badge
 * Shows blue checkmark for premium subscribers
 *
 * @param {Object} user - User object with imageUri, name, riderProfile, subscription
 * @param {number} size - Avatar size in pixels (default: 40)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showBadge - Whether to show verified badge (default: true)
 */
export default function UserAvatar({
	user,
	size = 40,
	className = "",
	showBadge = true,
}) {
	// Determine badge size based on avatar size
	const getBadgeSize = () => {
		if (size <= 32) return "sm";
		if (size <= 48) return "md";
		if (size <= 80) return "lg";
		return "xl";
	};

	// Check if user is premium
	const isPremium =
		user?.subscription?.plan === "premium" &&
		(user?.subscription?.status === "active" ||
			user?.subscription?.status === "canceled"); // Show badge until subscription actually ends

	// Get avatar background color from rider profile
	const avatarBgColor = user?.riderProfile?.avatarBgColor || "#374151";
	const avatarIcon = user?.riderProfile?.avatarIcon;

	return (
		<div className={`relative inline-block flex-shrink-0 ${className}`}>
			{user?.imageUri ? (
				<Image
					src={user.imageUri}
					alt={user.name || "User"}
					width={size}
					height={size}
					className="rounded-full object-cover"
					style={{ width: size, height: size }}
				/>
			) : avatarIcon ? (
				<div
					className="rounded-full flex items-center justify-center"
					style={{
						width: size,
						height: size,
						backgroundColor: avatarBgColor,
						fontSize: size * 0.5,
					}}
				>
					{avatarIcon}
				</div>
			) : (
				<div
					className="rounded-full bg-muted flex items-center justify-center"
					style={{ width: size, height: size }}
				>
					<User
						className="text-muted-foreground"
						style={{ width: size * 0.5, height: size * 0.5 }}
					/>
				</div>
			)}

			{/* Verified Badge */}
			{showBadge && isPremium && (
				<div
					className="absolute"
					style={{
						bottom: -2,
						right: -2,
					}}
				>
					<VerifiedBadge size={getBadgeSize()} />
				</div>
			)}
		</div>
	);
}
