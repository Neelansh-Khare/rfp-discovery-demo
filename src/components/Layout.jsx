import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bookmark, BarChart3, User, Bell } from "lucide-react";
import logo from "../assets/500x500-NC_Logo.png";
import { Company } from "@/entities/all";

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
	const [showNotifications, setShowNotifications] = React.useState(false);
	const [companyName, setCompanyName] = React.useState("Loading...");

	React.useEffect(() => {
		const loadCompany = async () => {
			try {
				const companies = await Company.list();
				if (companies.length > 0) {
					setCompanyName(companies[0].name);
				}
			} catch (error) {
				console.error("Error loading company:", error);
				setCompanyName("RFP Discovery");
			}
		};
		loadCompany();
	}, []);

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
							<p className="text-xs text-slate-500">{companyName}</p>
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

					{/* User Profile & Notifications */}
					<div className="flex items-center gap-3">
						{/* Notifications */}
						<div className="relative">
							<button
								onClick={() => setShowNotifications(!showNotifications)}
								className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
							>
								<Bell className="w-5 h-5 text-slate-600" />
								{/* Notification badge */}
								<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
							</button>

							{/* Notifications Dropdown */}
							{showNotifications && (
								<>
									{/* Backdrop */}
									<div
										className="fixed inset-0 z-10"
										onClick={() => setShowNotifications(false)}
									/>
									{/* Dropdown */}
									<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
										<div className="p-4 border-b border-slate-200">
											<h3 className="font-semibold text-slate-900">Notifications</h3>
										</div>
										<div className="p-4">
											<div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
												<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
												<div className="flex-1">
													<p className="text-sm font-medium text-slate-900">Hello!</p>
													<p className="text-xs text-slate-500 mt-1">
														This is a placeholder notification
													</p>
													<p className="text-xs text-slate-400 mt-1">Just now</p>
												</div>
											</div>
										</div>
									</div>
								</>
							)}
						</div>

						{/* Profile */}
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
