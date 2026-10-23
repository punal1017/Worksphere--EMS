// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import {
// //   Box,
// //   Button,
// //   Card,
// //   Container,
// //   Stack,
// //   Typography,
// // } from '@mui/material';
// // import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

// // type CurrentUser = {
// //   name: string;
// //   email: string;
// //   role: string;
// // };

// // export default function DashboardPage() {
// //   const router = useRouter();
// //   const [user] = useState<CurrentUser | null>(() => {
// //     if (typeof window === 'undefined') {
// //       return null;
// //     }

// //     const storedUser = localStorage.getItem('currentUser');

// //     if (!storedUser) {
// //       return null;
// //     }

// //     try {
// //       return JSON.parse(storedUser) as CurrentUser;
// //     } catch {
// //       localStorage.removeItem('currentUser');
// //       localStorage.removeItem('accessToken');
// //       return null;
// //     }
// //   });

// //   useEffect(() => {
// //     if (!user) {
// //       router.replace('/sign-in');
// //     }
// //   }, [router, user]);

// //   const handleSignOut = () => {
// //     localStorage.removeItem('accessToken');
// //     localStorage.removeItem('currentUser');
// //     router.replace('/sign-in');
// //   };

// //   if (!user) {
// //     return null;
// //   }

// //   return (
// //     <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
// //       <Box
// //         component="header"
// //         sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 2 }}
// //       >
// //         <Container
// //           maxWidth="lg"
// //           sx={{
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between',
// //           }}
// //         >
// //           <Stack direction="row" spacing={1} alignItems="center">
// //             <GroupsRoundedIcon sx={{ fontSize: 34, color: '#2563eb' }} />
// //             <Typography variant="h5" fontWeight={800} color="#0f172a">
// //               WorkSphere
// //             </Typography>
// //           </Stack>
// //           <Button onClick={handleSignOut} sx={{ textTransform: 'none' }}>
// //             Sign Out
// //           </Button>
// //         </Container>
// //       </Box>

// //       <Container maxWidth="lg" sx={{ py: 8 }}>
// //         <Typography variant="h3" fontWeight={800} color="#0f172a" gutterBottom>
// //           Welcome, {user.name}
// //         </Typography>
// //         <Typography color="text.secondary" sx={{ mb: 4 }}>
// //           You are signed in as {user.email} ({user.role}).
// //         </Typography>
// //         <Card
// //           elevation={0}
// //           sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 3 }}
// //         >
// //           <Typography variant="h6" fontWeight={700}>
// //             Your workspace is ready
// //           </Typography>
// //           <Typography color="text.secondary" sx={{ mt: 1 }}>
// //             Attendance and leave management tools will appear here.
// //           </Typography>
// //         </Card>
// //       </Container>
// //     </Box>
// //   );
// // }



// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';

// import {
//   Alert,
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CircularProgress,
//   Container,
//   Stack,
//   Typography,
// } from '@mui/material';

// import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
// import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
// import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
// import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
// import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   role: 'ADMIN' | 'HR' | 'EMPLOYEE';
// };

// export default function DashboardPage() {
//   const router = useRouter();

//   const [user, setUser] = useState<User | null>(null);
//   const [checkingLogin, setCheckingLogin] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     const savedUser = localStorage.getItem('currentUser');

//     if (!token || !savedUser) {
//       router.replace('/sign-in');
//       return;
//     }

//     try {
//       const parsedUser: User = JSON.parse(savedUser);

//       if (!parsedUser.name || !parsedUser.role) {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('currentUser');
//         router.replace('/sign-in');
//         return;
//       }

//       setUser(parsedUser);
//     } catch {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('currentUser');
//       router.replace('/sign-in');
//     } finally {
//       setCheckingLogin(false);
//     }
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('currentUser');

//     router.replace('/sign-in');
//   };

//   if (checkingLogin || !user) {
//     return (
//       <Box
//         sx={{
//           minHeight: '100vh',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   const roleTitle = {
//     ADMIN: 'Administrator',
//     HR: 'Human Resources',
//     EMPLOYEE: 'Employee',
//   }[user.role];

//   const dashboardCards = [
//     {
//       title: 'Team Management',
//       description: 'Manage employee information and team members.',
//       icon: <PeopleAltRoundedIcon />,
//       roles: ['ADMIN', 'HR'],
//       route: '/employees',
//     },
//     {
//       title: 'Attendance',
//       description: 'Track your daily check-in and check-out.',
//       icon: <AccessTimeRoundedIcon />,
//       roles: ['ADMIN', 'HR', 'EMPLOYEE'],
//       route: '/attendance',
//     },
//     {
//       title: 'Leave Management',
//       description: 'Apply for leave and review leave requests.',
//       icon: <EventAvailableRoundedIcon />,
//       roles: ['ADMIN', 'HR', 'EMPLOYEE'],
//       route: undefined,
//     },
//   ];

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
//       {/* Navbar */}
//       <Box
//         component="header"
//         sx={{
//           bgcolor: 'white',
//           borderBottom: '1px solid #e2e8f0',
//         }}
//       >
//         <Container
//           maxWidth="lg"
//           sx={{
//             minHeight: 76,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             gap: 2,
//           }}
//         >
//           <Stack direction="row" spacing={1} alignItems="center">
//             <GroupsRoundedIcon sx={{ fontSize: 36, color: '#2563eb' }} />
//             <Typography
//               variant="h5"
//               sx={{ fontWeight: 800, color: '#0f172a' }}
//             >
//               WorkSphere
//             </Typography>
//           </Stack>

//           <Button
//             variant="outlined"
//             startIcon={<LogoutRoundedIcon />}
//             onClick={handleLogout}
//             sx={{ borderRadius: 2, px: 3, textTransform: 'none' }}
//           >
//             Sign out
//           </Button>
//         </Container>
//       </Box>

//       {/* Main content */}
//       <Container maxWidth="lg" sx={{ py: 5 }}>
//         <Card
//           elevation={0}
//           sx={{
//             mb: 4,
//             borderRadius: 3,
//             color: 'white',
//             background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
//           }}
//         >
//           <CardContent sx={{ p: { xs: 3, md: 5 } }}>
//             <Stack
//               direction={{ xs: 'column', sm: 'row' }}
//               spacing={2}
//               alignItems={{ xs: 'flex-start', sm: 'center' }}
//             >
//               <Avatar
//                 sx={{
//                   width: 64,
//                   height: 64,
//                   bgcolor: 'rgba(255,255,255,0.2)',
//                   fontSize: 28,
//                 }}
//               >
//                 {user.name.charAt(0).toUpperCase()}
//               </Avatar>

//               <Box>
//                 <Typography variant="h4" fontWeight={800}>
//                   Welcome, {user.name}!
//                 </Typography>

//                 <Typography sx={{ mt: 1, opacity: 0.9 }}>
//                   You are signed in as {roleTitle}.
//                 </Typography>

//                 <Typography
//                   variant="body2"
//                   sx={{ mt: 0.5, opacity: 0.85 }}
//                 >
//                   {user.email}
//                 </Typography>
//               </Box>
//             </Stack>
//           </CardContent>
//         </Card>

//         <Typography
//           variant="h5"
//           fontWeight={800}
//           sx={{ mb: 1, color: '#0f172a' }}
//         >
//           Your Workspace
//         </Typography>

//         <Typography color="text.secondary" sx={{ mb: 3 , color: '#475569' }}>
//           Here is an overview of the features available to your role.
//         </Typography>

//         {!['ADMIN', 'HR', 'EMPLOYEE'].includes(user.role) && (
//           <Alert severity="warning" sx={{ mb: 3 }}>
//             Your account role is not recognized. Please contact your administrator.
//           </Alert>
//         )}

//         <Box
//           sx={{
//             display: 'grid',
//             gridTemplateColumns: {
//               xs: '1fr',
//               sm: 'repeat(2, 1fr)',
//               md: 'repeat(3, 1fr)',
//             },
//             gap: 3,
//           }}
//         >
//           {dashboardCards
//             .filter((card) => card.roles.includes(user.role))
//             .map((card) => (
//               <Card
//                 key={card.title}
//                 elevation={0}
//                 onClick={
//                   card.route ? () => router.push(card.route) : undefined
//                 }
//                 onKeyDown={
//                   card.route
//                     ? (event) => {
//                         if (event.key === 'Enter' || event.key === ' ') {
//                           event.preventDefault();
//                           router.push(card.route);
//                         }
//                       }
//                     : undefined
//                 }
//                 tabIndex={card.route ? 0 : undefined}
//                 sx={{
//                   border: '1px solid #e2e8f0',
//                   borderRadius: 3,
//                   transition: '0.2s',
//                   cursor: card.route ? 'pointer' : 'default',
//                   '&:hover': {
//                     borderColor: '#93c5fd',
//                     transform: 'translateY(-3px)',
//                   },
//                 }}
//               >
//                 <CardContent sx={{ p: 3 }}>
//                   <Box
//                     sx={{
//                       display: 'inline-flex',
//                       p: 1.5,
//                       borderRadius: 2,
//                       bgcolor: '#dbeafe',
//                       color: '#2563eb',
//                       mb: 2,
//                     }}
//                   >
//                     {card.icon}
//                   </Box>

//                   <Typography variant="h6" fontWeight={700}>
//                     {card.title}
//                   </Typography>

//                   <Typography
//                     variant="body2"
//                     color="text.secondary"
//                     sx={{ mt: 1, lineHeight: 1.8 }}
//                   >
//                     {card.description}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             ))}
//         </Box>
//       </Container>
//     </Box>
//   );
// }



// "use client";

// import { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import {
// Alert,
// Avatar,
// Box,
// Button,
// CircularProgress,
// Divider,
// Drawer,
// IconButton,
// List,
// ListItemButton,
// ListItemIcon,
// ListItemText,
// Stack,
// Tooltip,
// Typography,
// } from "@mui/material";

// import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
// import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
// import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
// import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
// import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
// import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
// import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
// import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
// import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

// type Role = "ADMIN" | "HR" | "EMPLOYEE";

// type User = {
// id: string | number;
// name: string;
// email: string;
// role: Role;
// };

// const SIDEBAR_WIDTH = 250;
// const COLLAPSED_WIDTH = 76;

// const navigationItems = [
// {
// title: "Dashboard",
// icon: <DashboardRoundedIcon />,
// route: "/dashboard",
// roles: ["ADMIN", "HR", "EMPLOYEE"],
// },
// {
// title: "Team Management",
// icon: <PeopleAltRoundedIcon />,
// route: "/employees",
// roles: ["ADMIN", "HR"],
// },
// {
// title: "Attendance",
// icon: <AccessTimeRoundedIcon />,
// route: "/attendance",
// roles: ["ADMIN", "HR", "EMPLOYEE"],
// },
// {
// title: "Leave Management",
// icon: <EventAvailableRoundedIcon />,
// route: "/leaves",
// roles: ["ADMIN", "HR", "EMPLOYEE"],
// },
// ];

// export default function DashboardPage() {
// const router = useRouter();
// const pathname = usePathname();

// const [user, setUser] = useState<User | null>(null);
// const [checkingLogin, setCheckingLogin] = useState(true);
// const [sidebarOpen, setSidebarOpen] = useState(true);
// const [mobileOpen, setMobileOpen] = useState(false);

// useEffect(() => {
// const token = localStorage.getItem("accessToken");
// const savedUser = localStorage.getItem("currentUser");

// if (!token || !savedUser) {
//   router.replace("/sign-in");
//   return;
// }

// try {
//   const parsedUser = JSON.parse(savedUser) as User;

//   if (
//     !parsedUser.name ||
//     !parsedUser.role ||
//     !["ADMIN", "HR", "EMPLOYEE"].includes(parsedUser.role)
//   ) {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("currentUser");
//     router.replace("/sign-in");
//     return;
//   }

//   setUser(parsedUser);
// } catch {
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("currentUser");
//   router.replace("/sign-in");
// } finally {
//   setCheckingLogin(false);
// }

// }, [router]);

// const handleLogout = () => {
// localStorage.removeItem("accessToken");
// localStorage.removeItem("currentUser");
// router.replace("/sign-in");
// };

// const handleNavigation = (route: string) => {
// setMobileOpen(false);
// router.push(route);
// };

// if (checkingLogin || !user) {
// return (
// <Box
// sx={{
// minHeight: "100vh",
// display: "flex",
// alignItems: "center",
// justifyContent: "center",
// bgcolor: "#f8fafc",
// }}
// >
// <CircularProgress />
// </Box>
// );
// }

// const roleTitle = {
// ADMIN: "Administrator",
// HR: "Human Resources",
// EMPLOYEE: "Employee",
// }[user.role];

// const visibleItems = navigationItems.filter((item) =>
// item.roles.includes(user.role)
// );

// const renderSidebar = (collapsed: boolean, isMobile = false) => (
// <Box
// sx={{
// width: "100%",
// height: "100%",
// display: "flex",
// flexDirection: "column",
// bgcolor: "#ffffff",
// }}
// >
// {/* Sidebar brand */}
// <Box
// sx={{
// height: 76,
// px: collapsed ? 1.5 : 2.5,
// display: "flex",
// alignItems: "center",
// justifyContent: collapsed ? "center" : "flex-start",
// gap: 1.5,
// flexShrink: 0,
// }}
// >
// <GroupsRoundedIcon
// sx={{ fontSize: 34, color: "#4056c9", flexShrink: 0 }}
// />

//     {!collapsed && (
//       <Typography
//         variant="h6"
//         fontWeight={800}
//         color="#172554"
//         noWrap
//       >
//         WorkSphere
//       </Typography>
//     )}
//   </Box>

//   <Divider />

//   {/* Navigation */}
//   <Box sx={{ flex: 1, py: 2, px: 1.25 }}>
//     {!collapsed && (
//       <Typography
//         variant="caption"
//         sx={{
//           px: 1.5,
//           mb: 1,
//           display: "block",
//           color: "#94a3b8",
//           fontWeight: 700,
//           letterSpacing: 1,
//         }}
//       >
//         WORKSPACE
//       </Typography>
//     )}

//     <List disablePadding>
//       {visibleItems.map((item) => {
//         const active = pathname === item.route;

//         const button = (
//           <ListItemButton
//             key={item.title}
//             selected={active}
//             onClick={() => handleNavigation(item.route)}
//             sx={{
//               minHeight: 48,
//               mb: 0.75,
//               px: collapsed ? 1.5 : 2,
//               borderRadius: 2.5,
//               justifyContent: collapsed ? "center" : "flex-start",
//               color: active ? "#4056c9" : "#64748b",
//               "& .MuiListItemIcon-root": {
//                 color: "inherit",
//                 minWidth: collapsed ? 0 : 38,
//                 justifyContent: "center",
//               },
//               "&.Mui-selected": {
//                 bgcolor: "#eef2ff",
//                 color: "#4056c9",
//               },
//               "&.Mui-selected:hover": {
//                 bgcolor: "#e0e7ff",
//               },
//               "&:hover": {
//                 bgcolor: "#f1f5f9",
//               },
//             }}
//           >
//             <ListItemIcon>{item.icon}</ListItemIcon>

//             {!collapsed && (
//               <ListItemText
//                 primary={item.title}
//                 primaryTypographyProps={{
//                   fontSize: 14,
//                   fontWeight: active ? 700 : 500,
//                   noWrap: true,
//                 }}
//               />
//             )}
//           </ListItemButton>
//         );

//         return collapsed && !isMobile ? (
//           <Tooltip key={item.title} title={item.title} placement="right">
//             {button}
//           </Tooltip>
//         ) : (
//           button
//         );
//       })}
//     </List>
//   </Box>

//   {/* User information */}
//   <Divider />

//   <Box sx={{ p: 1.5 }}>
//     <Stack
//       direction="row"
//       spacing={1.25}
//       alignItems="center"
//       justifyContent={collapsed ? "center" : "flex-start"}
//       sx={{ px: collapsed ? 0 : 0.75, py: 1 }}
//     >
//       <Avatar
//         sx={{
//           width: 38,
//           height: 38,
//           bgcolor: "#dbeafe",
//           color: "#1d4ed8",
//           fontWeight: 700,
//         }}
//       >
//         {user.name.charAt(0).toUpperCase()}
//       </Avatar>

//       {!collapsed && (
//         <Box sx={{ minWidth: 0, flex: 1 }}>
//           <Typography
//             variant="body2"
//             fontWeight={700}
//             color="#172554"
//             noWrap
//           >
//             {user.name}
//           </Typography>
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             noWrap
//             display="block"
//           >
//             {roleTitle}
//           </Typography>
//         </Box>
//       )}
//     </Stack>

//     <Tooltip title={collapsed ? "Sign out" : ""} placement="right">
//       <Button
//         fullWidth
//         color="inherit"
//         startIcon={!collapsed ? <LogoutRoundedIcon /> : undefined}
//         onClick={handleLogout}
//         sx={{
//           mt: 0.5,
//           minHeight: 42,
//           justifyContent: collapsed ? "center" : "flex-start",
//           px: collapsed ? 1 : 1.5,
//           color: "#64748b",
//           textTransform: "none",
//           borderRadius: 2,
//           "&:hover": {
//             bgcolor: "#fff1f2",
//             color: "#dc2626",
//           },
//         }}
//       >
//         {collapsed ? <LogoutRoundedIcon /> : "Sign out"}
//       </Button>
//     </Tooltip>
//   </Box>
// </Box>

// );

// return (
// <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
// {/* Desktop sidebar */}
// <Drawer
// variant="permanent"
// sx={{
// display: { xs: "none", md: "block" },
// width: sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
// flexShrink: 0,
// "& .MuiDrawer-paper": {
// width: sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
// boxSizing: "border-box",
// borderRight: "1px solid #e5eaf2",
// overflowX: "hidden",
// transition: "width 0.2s ease",
// bgcolor: "#fff",
// },
// }}
// >
// {renderSidebar(!sidebarOpen)}
// </Drawer>

//   {/* Mobile sidebar */}
//   <Drawer
//     variant="temporary"
//     open={mobileOpen}
//     onClose={() => setMobileOpen(false)}
//     ModalProps={{ keepMounted: true }}
//     sx={{
//       display: { xs: "block", md: "none" },
//       "& .MuiDrawer-paper": {
//         width: SIDEBAR_WIDTH,
//         boxSizing: "border-box",
//       },
//     }}
//   >
//     {renderSidebar(false, true)}
//   </Drawer>

//   {/* Main area */}
//   <Box
//     sx={{
//       minWidth: 0,
//       minHeight: "100vh",
//       ml: { xs: 0, md: `${sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH}px` },
//       transition: "margin-left 0.2s ease",
//     }}
//   >
//     {/* Top navbar */}
//     <Box
//       component="header"
//       sx={{
//         height: 76,
//         px: { xs: 2, md: 3.5 },
//         bgcolor: "#ffffff",
//         borderBottom: "1px solid #e5eaf2",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         position: "sticky",
//         top: 0,
//         zIndex: 5,
//       }}
//     >
//       <Stack direction="row" spacing={1.5} alignItems="center">
//         <IconButton
//           onClick={() => {
//             if (window.innerWidth < 900) {
//               setMobileOpen(true);
//             } else {
//               setSidebarOpen((previous) => !previous);
//             }
//           }}
//           aria-label="Toggle sidebar"
//           sx={{
//             border: "1px solid #e2e8f0",
//             borderRadius: 2,
//             color: "#334155",
//           }}
//         >
//           <Box sx={{ display: { xs: "block", md: "none" } }}>
//             <MenuRoundedIcon />
//           </Box>
//           <Box sx={{ display: { xs: "none", md: "block" } }}>
//             {sidebarOpen ? (
//               <ChevronLeftRoundedIcon />
//             ) : (
//               <ChevronRightRoundedIcon />
//             )}
//           </Box>
//         </IconButton>

//         <Box>
//           <Typography
//             variant="subtitle1"
//             fontWeight={800}
//             color="#172554"
//           >
//             Dashboard
//           </Typography>
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             sx={{ display: { xs: "none", sm: "block" } }}
//           >
//             Your workspace at a glance
//           </Typography>
//         </Box>
//       </Stack>

//       <Avatar
//         sx={{
//           width: 40,
//           height: 40,
//           bgcolor: "#4056c9",
//           fontWeight: 700,
//         }}
//       >
//         {user.name.charAt(0).toUpperCase()}
//       </Avatar>
//     </Box>

//     {/* Dashboard content */}
//     <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
//       {!["ADMIN", "HR", "EMPLOYEE"].includes(user.role) && (
//         <Alert severity="warning" sx={{ mb: 3 }}>
//           Your account role is not recognized. Please contact your administrator.
//         </Alert>
//       )}

//       <Box
//         sx={{
//           mb: 4,
//           p: { xs: 3, md: 5 },
//           borderRadius: 4,
//           color: "#fff",
//           background: "linear-gradient(135deg, #1e3a8a, #4056c9 65%, #6366f1)",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         <Box
//           sx={{
//             position: "absolute",
//             width: 220,
//             height: 220,
//             borderRadius: "50%",
//             border: "40px solid rgba(255,255,255,0.08)",
//             right: -50,
//             top: -90,
//           }}
//         />

//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={2.5}
//           alignItems={{ xs: "flex-start", sm: "center" }}
//           sx={{ position: "relative" }}
//         >
//           <Avatar
//             sx={{
//               width: 68,
//               height: 68,
//               bgcolor: "rgba(255,255,255,0.18)",
//               border: "1px solid rgba(255,255,255,0.25)",
//               fontSize: 28,
//               fontWeight: 700,
//             }}
//           >
//             {user.name.charAt(0).toUpperCase()}
//           </Avatar>

//           <Box>
//             <Typography
//               variant="h4"
//               fontWeight={800}
//               sx={{ fontSize: { xs: 26, md: 34 } }}
//             >
//               Welcome back, {user.name}!
//             </Typography>

//             <Typography sx={{ mt: 1, opacity: 0.9 }}>
//               Signed in as {roleTitle}
//             </Typography>

//             <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
//               {user.email}
//             </Typography>
//           </Box>
//         </Stack>
//       </Box>

//       <Typography
//         variant="h5"
//         fontWeight={800}
//         color="#172554"
//         sx={{ mb: 1 }}
//       >
//         Your Workspace
//       </Typography>

//       <Typography color="text.secondary" sx={{ mb: 3 }}>
//         Choose a section from the sidebar to get started.
//       </Typography>

//       <Box
//         sx={{
//           p: { xs: 3, md: 4 },
//           bgcolor: "#fff",
//           border: "1px solid #e5eaf2",
//           borderRadius: 3,
//         }}
//       >
//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={2}
//           alignItems={{ xs: "flex-start", sm: "center" }}
//         >
//           <Box
//             sx={{
//               width: 52,
//               height: 52,
//               borderRadius: 2.5,
//               display: "grid",
//               placeItems: "center",
//               bgcolor: "#eef2ff",
//               color: "#4056c9",
//             }}
//           >
//             <DashboardRoundedIcon fontSize="large" />
//           </Box>

//           <Box sx={{ flex: 1 }}>
//             <Typography fontWeight={800} color="#172554">
//               Welcome to your workspace
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               Use the sidebar to access{" "}
//               {visibleItems
//                 .filter((item) => item.route !== "/dashboard")
//                 .map((item) => item.title)
//                 .join(", ")}
//               .
//             </Typography>
//           </Box>

//           <Button
//             variant="outlined"
//             onClick={() => setSidebarOpen(true)}
//             startIcon={<MenuRoundedIcon />}
//             sx={{
//               display: { xs: "none", md: "inline-flex" },
//               textTransform: "none",
//               borderRadius: 2,
//               whiteSpace: "nowrap",
//             }}
//           >
//             Show sidebar
//           </Button>
//         </Stack>
//       </Box>
//     </Box>
//   </Box>
// </Box>

// );
// }



"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from "recharts";

import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useProtectedRoute } from "../../components/ProtectedRoute";

type Role = "ADMIN" | "HR" | "EMPLOYEE";

type User = {
  id: string | number;
  name: string;
  email: string;
  role: Role;
};

const SIDEBAR_WIDTH = 250;
const COLLAPSED_WIDTH = 76;
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`;

type AttendanceSummary = {
  date: string;
  scope: "COMPANY" | "PERSONAL";
  total: number;
  present: number;
  absent: number;
  onLeave: number;
  breakdown: {
    PRESENT: number;
    ABSENT: number;
    ON_LEAVE: number;
  };
};

const attendanceColors = {
  PRESENT: "#16a34a",
  ABSENT: "#ef4444",
  ON_LEAVE: "#f59e0b",
};

const getLocalDateValue = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10);
};

const navigationItems = [
  {
    title: "Dashboard",
    icon: <DashboardRoundedIcon />,
    route: "/dashboard",
    roles: ["ADMIN", "HR", "EMPLOYEE"],
  },
  {
    title: "Team Management",
    icon: <PeopleAltRoundedIcon />,
    route: "/employees",
    roles: ["ADMIN", "HR"],
  },
  {
    title: "Attendance",
    icon: <AccessTimeRoundedIcon />,
    route: "/attendance",
    roles: ["ADMIN", "HR", "EMPLOYEE"],
  },
  {
    title: "Leave Management",
    icon: <EventAvailableRoundedIcon />,
    route: "/leaves",
    roles: ["ADMIN", "HR", "EMPLOYEE"],
  },
];

export default function DashboardPage() {
  useProtectedRoute();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDateValue);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("currentUser");

    if (!token || !savedUser) {
      router.replace("/sign-in");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser) as User;

      if (
        !parsedUser.name ||
        !parsedUser.role ||
        !["ADMIN", "HR", "EMPLOYEE"].includes(parsedUser.role)
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        router.replace("/sign-in");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      router.replace("/sign-in");
    } finally {
      setCheckingLogin(false);
    }
  }, [router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAttendanceSummary = async () => {
      setAttendanceLoading(true);
      setAttendanceError("");

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get<AttendanceSummary>(
          `${API_URL}/attendance/dashboard-summary`,
          {
            params: { date: selectedDate },
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setAttendanceSummary(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("currentUser");
            router.replace("/sign-in");
            return;
          }
          setAttendanceError(
            error.response?.data?.message ||
              "Could not load attendance summary.",
          );
        } else {
          setAttendanceError("Could not load attendance summary.");
        }
        setAttendanceSummary(null);
      } finally {
        setAttendanceLoading(false);
      }
    };

    void fetchAttendanceSummary();
  }, [router, selectedDate, user]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    router.replace("/sign-in");
  };

  const handleNavigation = (route: string) => {
    setMobileOpen(false);
    router.push(route);
  };

  if (checkingLogin || !user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const roleTitle = {
    ADMIN: "Administrator",
    HR: "Human Resources",
    EMPLOYEE: "Employee",
  }[user.role];

  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const renderSidebar = (collapsed: boolean, isMobile = false) => (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
      }}
    >
      {/* Sidebar header and toggle */}
      <Box
        sx={{
          height: collapsed ? 104 : 76,
          px: collapsed ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          flexDirection: collapsed ? "column" : "row",
          gap: collapsed ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ minWidth: 0, overflow: "hidden" }}
        >
          <GroupsRoundedIcon
            sx={{ fontSize: 32, color: "#4056c9", flexShrink: 0 }}
          />

          {!collapsed && (
            <Typography
              variant="h6"
              fontWeight={800}
              color="#172554"
              noWrap
            >
              WorkSphere
            </Typography>
          )}
        </Stack>

        {!isMobile && (
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen((previous) => !previous)}
              aria-label="Toggle sidebar"
              sx={{
                flexShrink: 0,
                color: "#64748b",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "#eef2ff",
                  color: "#4056c9",
                },
              }}
            >
              {collapsed ? (
                <ChevronRightRoundedIcon fontSize="small" />
              ) : (
                <ChevronLeftRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}

        {isMobile && (
          <IconButton
            size="small"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            sx={{ color: "#64748b" }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2, px: 1.25 }}>
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              mb: 1,
              display: "block",
              color: "#94a3b8",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            WORKSPACE
          </Typography>
        )}

        <List disablePadding>
          {visibleItems.map((item) => {
            const active = pathname === item.route;

            const button = (
              <ListItemButton
                key={item.title}
                selected={active}
                onClick={() => handleNavigation(item.route)}
                sx={{
                  minHeight: 46,
                  mb: 0.75,
                  px: collapsed ? 1.5 : 2,
                  borderRadius: 2.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  color: active ? "#4056c9" : "#64748b",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                    minWidth: collapsed ? 0 : 38,
                    justifyContent: "center",
                  },
                  "&.Mui-selected": {
                    bgcolor: "#eef2ff",
                    color: "#4056c9",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "#e0e7ff",
                  },
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      noWrap: true,
                    }}
                  />
                )}
              </ListItemButton>
            );

            return collapsed && !isMobile ? (
              <Tooltip key={item.title} title={item.title} placement="right">
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </List>
      </Box>

      {/* User section */}
      <Divider />

      <Box sx={{ p: 1.5 }}>
        <ButtonBase
          onClick={() => router.push("/profile")}
          aria-label="Open profile"
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 2,
            px: collapsed ? 0 : 0.75,
            py: 1,
            textAlign: "left",
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            justifyContent={collapsed ? "center" : "flex-start"}
          >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#dbeafe",
              color: "#1d4ed8",
              fontWeight: 700,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>

          {!collapsed && (
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color="#172554"
                noWrap
              >
                {user.name}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                noWrap
              >
                {roleTitle}
              </Typography>
            </Box>
          )}
          </Stack>
        </ButtonBase>

        <Tooltip title={collapsed ? "Sign out" : ""} placement="right">
          <Button
            fullWidth
            color="inherit"
            startIcon={!collapsed ? <LogoutRoundedIcon /> : undefined}
            onClick={handleLogout}
            sx={{
              mt: 0.5,
              minHeight: 40,
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 1 : 1.5,
              color: "#64748b",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#fff1f2",
                color: "#dc2626",
              },
            }}
          >
            {collapsed ? <LogoutRoundedIcon /> : "Sign out"}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #e5eaf2",
            overflowX: "hidden",
            transition: "width 0.2s ease",
            bgcolor: "#fff",
          },
        }}
      >
        {renderSidebar(!sidebarOpen)}
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {renderSidebar(false, true)}
      </Drawer>

      {/* Main dashboard */}
      <Box
        component="main"
        sx={{
          minWidth: 0,
          minHeight: "100vh",
          ml: { xs: 0, md: `${sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH}px` },
          transition: "margin-left 0.2s ease",
          p: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {/* Mobile menu toggle */}
        <IconButton
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
          sx={{
            display: { xs: "inline-flex", md: "none" },
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 10,
            bgcolor: "#fff",
            border: "1px solid #e5eaf2",
            borderRadius: 2,
            color: "#334155",
            "&:hover": { bgcolor: "#eef2ff" },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Stack spacing={3} sx={{ width: "100%", maxWidth: 1100, mt: { xs: 7, md: 0 } }}>
          <Box
            sx={{
              width: "100%",
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              color: "#fff",
              background:
                "linear-gradient(135deg, #1e3a8a, #4056c9 65%, #6366f1)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(64, 86, 201, 0.12)",
            }}
          >
          {/* Decorative background circle */}
          <Box
            sx={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: "40px solid rgba(255,255,255,0.08)",
              right: -50,
              top: -90,
              pointerEvents: "none",
            }}
          />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ position: "relative" }}
            >
            <Avatar
              sx={{
                width: 68,
                height: 68,
                bgcolor: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.25)",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ fontSize: { xs: 26, md: 34 } }}
              >
                Welcome back, {user.name}!
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 0.5, opacity: 0.8, overflowWrap: "anywhere" }}
              >
                {user.email}
              </Typography>
            </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            <Card elevation={0} sx={{ border: "1px solid #e5eaf2", borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="#172554">
                      Attendance Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {attendanceSummary?.scope === "PERSONAL"
                        ? "Your attendance for the selected date"
                        : "Company attendance for the selected date"}
                    </Typography>
                  </Box>
                  <TextField
                    type="date"
                    label="Date"
                    size="small"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ minWidth: { sm: 155 } }}
                  />
                </Stack>

                {attendanceLoading ? (
                  <Box sx={{ display: "grid", placeItems: "center", minHeight: 260 }}>
                    <CircularProgress />
                  </Box>
                ) : attendanceError ? (
                  <Alert severity="error">{attendanceError}</Alert>
                ) : attendanceSummary?.total ? (
                  <>
                    <Box sx={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Present", value: attendanceSummary.present, key: "PRESENT" },
                              { name: "Absent", value: attendanceSummary.absent, key: "ABSENT" },
                              { name: "On leave", value: attendanceSummary.onLeave, key: "ON_LEAVE" },
                            ]}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={2}
                          >
                            {(["PRESENT", "ABSENT", "ON_LEAVE"] as const).map((key) => (
                              <Cell key={key} fill={attendanceColors[key]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {[
                        ["PRESENT", "Present", attendanceSummary.present],
                        ["ABSENT", "Absent", attendanceSummary.absent],
                        ["ON_LEAVE", "On leave", attendanceSummary.onLeave],
                      ].map(([key, label, value]) => (
                        <Stack
                          key={key}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: attendanceColors[key as keyof typeof attendanceColors],
                              }}
                            />
                            <Typography variant="body2">{label}</Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight={700}>
                            {value} ({Math.round((Number(value) / attendanceSummary.total) * 100)}%)
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                ) : (
                  <Box sx={{ display: "grid", placeItems: "center", minHeight: 260 }}>
                    <Typography color="text.secondary">
                      No active attendance data for {selectedDate}.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ border: "1px solid #e5eaf2", borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" fontWeight={800} color="#172554">
                  HR Posts
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Company updates and announcements will appear here.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
