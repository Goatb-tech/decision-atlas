import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowsClockwise, Compass, SignOut, Sparkle, SquaresFour } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { useAtlas } from "../context/AtlasContext";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm transition ${
    isActive
      ? "bg-[rgba(124,225,207,0.14)] text-white"
      : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

export function TopNav() {
  const { user, logout } = useAuth();
  const { syncing } = useAtlas();

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(4,16,23,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[rgba(124,225,207,0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <Compass size={22} weight="duotone" className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-slate-400">
              Decision Atlas
            </p>
            <p className="text-sm text-slate-200">Strategic pathfinding with memory</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <NavLink to="/dashboard" className={navItemClass}>
                Dashboard
              </NavLink>
              <NavLink to="/scenarios/new" className={navItemClass}>
                New scenario
              </NavLink>
            </>
          ) : (
            <>
              <Link to="/login" className="ghost-button">
                Sign in
              </Link>
              <Link to="/register" className="action-button">
                Open Atlas
              </Link>
            </>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <motion.div
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:flex md:items-center md:gap-2"
              animate={syncing ? { opacity: [0.65, 1, 0.65] } : undefined}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {syncing ? <ArrowsClockwise size={16} className="animate-spin" /> : <Sparkle size={16} />}
              {syncing ? "Syncing atlas" : "Saved locally"}
            </motion.div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 md:block">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button type="button" onClick={logout} className="ghost-button">
              <SignOut size={16} />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <Link to="/" className="ghost-button md:hidden">
            <SquaresFour size={16} />
            Home
          </Link>
        )}
      </div>
    </header>
  );
}
