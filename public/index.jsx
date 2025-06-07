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
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <a key={item.id} className="max-w-[480px]" href={item.telegram} target="_blank" rel="nofollow">
              <img src={`https://img.youtube.com/vi/${item.id}/0.jpg`} alt={item.title} />
              <div className="bg-black text-neutral-500 p-2 text-center">
                <span>{item.year}</span>
                <span className="text-neutral-700 mx-2">|</span>
                <span>{item.categories.join(", ")}</span>
                <span className="text-neutral-700 mx-2">|</span>
                <span>{item.levels.join(", ")}</span>
                <span className="text-neutral-700 mx-2">|</span>
                <span>{item.authors.join(", ")}</span>
              </div>
            </a>
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
