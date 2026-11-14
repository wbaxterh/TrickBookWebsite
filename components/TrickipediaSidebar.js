import { BookOpen, List, Menu, Users, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { getCategories } from '../lib/api';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const categoryItemClass =
  'focus:bg-yellow-500/20 focus:text-foreground data-[state=checked]:text-yellow-400';

export default function TrickipediaSidebar({
  selectedCategory,
  onCategoryChange,
  activeTab,
  onTabChange,
}) {
  const [categories, setCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();
  const toggle = useRef(null);
  const closeMobile = () => {
    setMobileOpen(false);
    toggle.current?.focus();
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Close mobile menu when tab changes
  const handleTabChange = (tab) => {
    onTabChange(tab);
    if (mobileOpen) closeMobile();
  };

  // Close mobile menu when category changes
  const handleCategoryChange = (category) => {
    onCategoryChange(category);
    if (mobileOpen) closeMobile();
  };

  const sidebarContent = (
    <>
      {/* Category Dropdown */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2 block">Category</p>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger
            aria-label="Trick category"
            className="min-h-11 w-full bg-background border-yellow-500/50 hover:border-yellow-500"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className={categoryItemClass}>
              All Categories
            </SelectItem>
            {categories.map((category) => (
              <SelectItem
                key={category._id}
                value={category.name.toLowerCase()}
                className={categoryItemClass}
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Tabs */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2 block">Browse</p>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          orientation="vertical"
          className="w-full"
        >
          <TabsList className="flex h-auto flex-col w-full gap-1 bg-transparent p-0">
            <TabsTrigger
              value="trickipedia"
              className="min-h-11 w-full justify-start gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              <BookOpen className="h-4 w-4" />
              Trickipedia
            </TabsTrigger>
            <TabsTrigger
              value="my-lists"
              className="min-h-11 w-full justify-start gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              <List className="h-4 w-4" />
              My Trick Lists
            </TabsTrigger>
            <TabsTrigger
              value="homie-lists"
              className="min-h-11 w-full justify-start gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              <Users className="h-4 w-4" />
              Homie Trick Lists
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Info Section */}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Browse tricks from the Trickipedia, manage your personal trick lists, or discover what
          your homies are learning.
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        ref={toggle}
        aria-label={mobileOpen ? 'Close trick navigation' : 'Open trick navigation'}
        aria-expanded={mobileOpen}
        aria-controls={panelId}
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-50 h-11 w-11 lg:hidden bg-background border-yellow-500/50"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Dismiss trick navigation"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        id={panelId}
        onKeyDown={(event) => {
          if (event.key === 'Escape') closeMobile();
        }}
        className={`fixed top-32 bottom-0 left-0 w-64 overflow-y-auto bg-card border-r border-border p-4 flex-col gap-6 z-50 lg:hidden ${
          mobileOpen ? 'flex' : 'hidden'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-card border-r border-border p-4 flex-col gap-6 sticky top-0 h-screen overflow-y-auto self-start">
        {sidebarContent}
      </aside>
    </>
  );
}
