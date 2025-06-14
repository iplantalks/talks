const { useState, useEffect } = React;

/**
 * @param {{years:string[], levels:string[], categories:string[], authors:string[], statuses:string[]}} props
 */
function App({ years, levels, categories, authors, statuses }) {
  const [search, setSearch] = useSearch();
  const [selectedYears, toggleYears] = useCheckboxes("years");
  const [selectedCategories, toggleCategories] = useCheckboxes("categories");
  const [selectedLevels, toggleLevels] = useCheckboxes("levels");
  const [selectedAuthors, toggleAuthors] = useCheckboxes("authors");
  const [selectedStatuses, toggleStatuses] = useCheckboxes("statuses");
  const [items, setItems] = useState([]);

  const submit = () => {
    if (typeof gtag !== "undefined") {
      gtag("event", "view_search_results", {
        search_term: search,
      });
    }
    fetch("/search" + window.location.search)
      .then((r) => r.json())
      .then(setItems);
  };

  useEffect(() => {
    submit();
  }, []);

  return (
    <div>
      <a href="/" className="text-2xl font-bold text-center my-10 block">
        <span className="text-zinc-500">Гайд по етерам спільноти </span>iPlan Talks
      </a>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Пошук..." className="border border-neutral-300 bg-inherit text-inherit rounded px-2 py-1 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="flex-0 bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600 block w-full" onClick={() => submit()}>
              <Search />
            </button>
          </div>
          <Checkboxes name="Тематика" selected={selectedCategories} options={categories} toggle={toggleCategories} />
          <Checkboxes name="Рік" selected={selectedYears} options={years} toggle={toggleYears} />
          <Checkboxes name="Складність" selected={selectedLevels} options={levels} toggle={toggleLevels} />
          <Checkboxes name="Спікер" selected={selectedAuthors} options={authors} toggle={toggleAuthors} />
          <Checkboxes name="Статус" selected={selectedStatuses} options={statuses} toggle={toggleStatuses} />
        </div>
        <div className="flex flex-col gap-8">
          {items.map((item) => (
            <Video key={item.id} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function useSearch() {
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get("search") || "");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    window.history.pushState(null, "", `${window.location.pathname}?${params}`);
  }, [search]);
  return [search, setSearch];
}

function useCheckboxes(key) {
  const [selected, setSelected] = useState(() => new URLSearchParams(window.location.search).getAll(key));
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    selected.forEach((value) => params.append(key, value));
    window.history.pushState(null, "", `${window.location.pathname}?${params}`);
  }, [selected, key]);

  const toggle = (value) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  return [selected, toggle];
}

function Video({ id, title, year, categories, levels, authors, telegram }) {
  return (
    <a className="max-w-[480px]" href={telegram} target="_blank" rel="nofollow">
      <div className="aspect-video bg-center rounded" style={{ backgroundImage: `url("https://img.youtube.com/vi/${id}/0.jpg")` }} />
      <div className="pt-2 text-xl font-bold">{title}</div>
      <div className="pt-2 flex gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar />
          <span>{year}</span>
        </div>
        <div className="flex items-center gap-2">
          <Bookmark />
          <span>{categories.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <DumpBell />
          <span>{levels.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserRounded />
          <span>{authors.join(", ")}</span>
        </div>
      </div>
    </a>
  );
}

function Checkboxes({ name, selected, options, toggle }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{name}</h2>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-start gap-2">
            <input className="hidden" type="checkbox" name={name} defaultValue={option} checked={selected.includes(option)} onChange={() => toggle(option)} />
            {selected.includes(option) ? <SquareChecked /> : <Square />}
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Square() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

function SquareChecked() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Search() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

function Calendar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar1-icon lucide-calendar-1">
      <path d="M11 14h1v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </svg>
  );
}

function Bookmark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark-icon lucide-bookmark">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function UserRounded() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round-icon lucide-user-round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function DumpBell() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dumbbell-icon lucide-dumbbell">
      <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z" />
      <path d="m2.5 21.5 1.4-1.4" />
      <path d="m20.1 3.9 1.4-1.4" />
      <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z" />
      <path d="m9.6 14.4 4.8-4.8" />
    </svg>
  );
}
