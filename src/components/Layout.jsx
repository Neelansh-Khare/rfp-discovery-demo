import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bookmark, BarChart3, User } from "lucide-react";
import logo from "../assets/500x500-NC_Logo.png";

const navigationItems = [
	{
		title: "Dashboard",
		url: "/",
		icon: BarChart3,
	},
	{
		title: "Opportunities",
		url: "/opportunities",
		icon: Search,
	},
	{
		title: "Saved",
		url: "/pipeline",
		icon: Bookmark,
	},
];

export default function Layout({ children }) {
	const location = useLocation();

	return (
		<div className="min-h-screen flex flex-col w-full bg-slate-50">
			{/* Horizontal Navigation Bar */}
			<header className="bg-white border-b border-slate-200 shadow-sm">
				<div className="flex items-center justify-between px-6 py-4">
					{/* Logo and Brand */}
					<div className="flex items-center gap-3">
						<img
							src={logo}
							alt="RFP Discovery Logo"
							className="w-10 h-10 rounded-lg object-cover"
						/>
						<div>
							<h2 className="font-bold text-slate-900 text-lg">
								RFP Discovery
							</h2>
							<p className="text-xs text-slate-500">MODUS Planning</p>
						</div>
					</div>

					{/* Tab-style Navigation */}
					<nav className="flex items-center gap-2">
						{navigationItems.map((item) => {
							const Icon = item.icon;
							const isActive = location.pathname === item.url;
							return (
								<Link
									key={item.title}
									to={item.url}
									className={`flex items-center gap-2 px-6 py-3 rounded-t-lg border-b-2 transition-all duration-200 ${
										isActive
											? "bg-neura-teal/10 border-neura-teal text-neura-teal font-semibold"
											: "border-transparent text-slate-600 hover:text-neura-teal hover:bg-slate-50"
									}`}
								>
									<Icon className="w-5 h-5" />
									<span>{item.title}</span>
								</Link>
							);
						})}
					</nav>

					{/* User Profile */}
					<div className="flex items-center gap-3">
						<Link
							to="/profile"
							className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
						>
							<div className="w-8 h-8 bg-neura-teal rounded-full flex items-center justify-center">
								<User className="w-4 h-4 text-white" />
							</div>
						</Link>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	);
}
