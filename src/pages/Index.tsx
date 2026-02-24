import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const GAMES_API = "https://functions.poehali.dev/228f1bf7-c624-4129-968e-6ef59dcf176a";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/aa9c31d7-92e1-4021-830d-a2684567d329/files/6f342523-d1b0-45da-bded-6ec860faf02e.jpg";
const FALLBACK_COVER = "https://cdn.poehali.dev/projects/aa9c31d7-92e1-4021-830d-a2684567d329/files/dc02dddf-24e8-4d00-9a14-7843ea28a2d3.jpg";

const GENRES = ["Все", "Экшен", "RPG", "Шутер", "Стратегия", "Гонки", "Хоррор", "Инди", "Другое"];

type Game = {
  id: number;
  title: string;
  genre: string;
  size: string;
  rating: number;
  downloads: string;
  year: number;
  cover_url: string | null;
  tag: string;
  is_new: boolean;
  description: string;
};

type Tab = "home" | "catalog" | "new" | "search" | "favorites" | "admin";

const tagColors: Record<string, string> = {
  "Хит": "bg-pink-500/20 text-pink-400 border-pink-500/40",
  "Новинка": "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  "Топ": "bg-purple-500/20 text-purple-400 border-purple-500/40",
  "Инди": "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
};

const ADMIN_PASSWORD = "cloud7@tiger3#coffee9$moon1%puzzle";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadedId, setDownloadedId] = useState<number | null>(null);

  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminPassErr, setAdminPassErr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [coverExt, setCoverExt] = useState("jpg");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    genre: "Экшен",
    size: "",
    rating: "8.0",
    year: "2025",
    tag: "",
    is_new: true,
    description: "",
  });

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch(GAMES_API);
      const data = await res.json();
      setGames(data.games || []);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGames(); }, []);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const handleDownload = (id: number) => {
    setDownloadedId(id);
    setTimeout(() => setDownloadedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    setCoverExt(ext);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setCoverPreview(result);
      setCoverBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.genre) return;
    setUploading(true);
    try {
      await fetch(GAMES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: parseFloat(form.rating),
          year: parseInt(form.year),
          cover_base64: coverBase64,
          cover_ext: coverExt,
        }),
      });
      setUploadSuccess(true);
      setForm({ title: "", genre: "Экшен", size: "", rating: "8.0", year: "2025", tag: "", is_new: true, description: "" });
      setCoverPreview(null);
      setCoverBase64(null);
      await fetchGames();
      setTimeout(() => setUploadSuccess(false), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${GAMES_API}?id=${id}`, { method: "DELETE" });
    await fetchGames();
  };

  const filteredGames = games.filter((g) => {
    const matchGenre = selectedGenre === "Все" || g.genre === selectedGenre;
    const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGenre && matchSearch;
  });

  const newGames = games.filter((g) => g.is_new);
  const favoriteGames = games.filter((g) => favorites.includes(g.id));

  const GameCard = ({ game, isAdmin }: { game: Game; isAdmin?: boolean }) => (
    <div className="card-hover bg-card border border-border rounded-xl overflow-hidden group animate-fade-in">
      <div className="relative">
        <img
          src={game.cover_url || FALLBACK_COVER}
          alt={game.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {game.tag && tagColors[game.tag] && (
          <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full border font-semibold ${tagColors[game.tag]}`}>
            {game.tag}
          </span>
        )}
        {!isAdmin && (
          <button
            onClick={() => toggleFavorite(game.id)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:border-purple-500/60 transition-all"
          >
            <Icon name="Heart" size={16} className={favorites.includes(game.id) ? "fill-pink-500 text-pink-500" : "text-white/60"} />
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => handleDelete(game.id)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-500 transition-all"
          >
            <Icon name="Trash2" size={16} className="text-white" />
          </button>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Icon name="Star" size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">{game.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-oswald text-lg font-semibold text-white mb-1 leading-tight">{game.title}</h3>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs text-muted-foreground">{game.genre}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{game.year}</span>
          {game.size && <><span className="text-xs text-muted-foreground">•</span><span className="text-xs text-muted-foreground">{game.size}</span></>}
        </div>
        {!isAdmin && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="Download" size={12} />
              <span>{game.downloads}</span>
            </div>
            <button
              onClick={() => handleDownload(game.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all ${downloadedId === game.id ? "bg-green-600" : "neon-btn"}`}
            >
              <Icon name={downloadedId === game.id ? "Check" : "Download"} size={14} />
              {downloadedId === game.id ? "Готово!" : "Скачать"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const EmptyState = ({ icon, text }: { icon: string; text: string }) => (
    <div className="text-center py-20 text-muted-foreground">
      <Icon name={icon} size={48} className="mx-auto mb-4 opacity-30" fallback="CircleAlert" />
      <p>{text}</p>
    </div>
  );

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
          <div className="w-full h-44 bg-muted" />
          <div className="p-4 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <button onClick={() => setActiveTab("home")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg neon-btn flex items-center justify-center">
              <Icon name="Gamepad2" size={18} className="text-white" />
            </div>
            <span className="font-oswald text-xl font-bold tracking-wider">
              <span className="neon-text-purple">MR.</span>
              <span className="text-white"> GAMES</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {[
              { id: "home", label: "Главная", icon: "Home" },
              { id: "catalog", label: "Каталог", icon: "Grid3x3" },
              { id: "new", label: "Новинки", icon: "Sparkles" },
              { id: "search", label: "Поиск", icon: "Search" },
              { id: "favorites", label: "Избранное", icon: "Heart" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon name={tab.icon} size={15} />
                {tab.label}
                {tab.id === "favorites" && favorites.length > 0 && (
                  <span className="bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <div className="flex md:hidden items-center gap-1">
              {[
                { id: "home", icon: "Home" },
                { id: "catalog", icon: "Grid3x3" },
                { id: "new", icon: "Sparkles" },
                { id: "search", icon: "Search" },
                { id: "favorites", icon: "Heart" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`p-2 rounded-lg transition-all ${activeTab === tab.id ? "text-purple-400" : "text-muted-foreground"}`}
                >
                  <Icon name={tab.icon} size={20} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveTab("admin")}
              className={`p-2 rounded-lg transition-all ${activeTab === "admin" ? "text-yellow-400" : "text-muted-foreground hover:text-white"}`}
              title="Админ-панель"
            >
              <Icon name="Settings" size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* HOME */}
        {activeTab === "home" && (
          <div className="space-y-12 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden min-h-[420px] flex items-end">
              <img src={HERO_IMAGE} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 scanline" />
              <div className="relative z-10 p-8 md:p-12 max-w-2xl animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">
                    {loading ? "Загрузка..." : `${games.length} игр в каталоге`}
                  </span>
                </div>
                <h1 className="font-oswald text-5xl md:text-7xl font-bold leading-none mb-4">
                  <span className="neon-text-purple">MR.</span>
                  <br />
                  <span className="text-white">GAMES</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-6 max-w-md">
                  Тысячи игр бесплатно. Скачивай, играй, сохраняй в избранное — всё в одном месте.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setActiveTab("catalog")} className="neon-btn text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2">
                    <Icon name="Grid3x3" size={18} />
                    Каталог игр
                  </button>
                  <button onClick={() => setActiveTab("new")} className="px-6 py-3 rounded-xl border border-cyan-500/40 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition-all flex items-center gap-2">
                    <Icon name="Sparkles" size={18} />
                    Новинки
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Игр в каталоге", value: String(games.length), icon: "Gamepad2", color: "text-purple-400" },
                { label: "Жанров", value: String(new Set(games.map(g => g.genre)).size), icon: "Layers", color: "text-cyan-400" },
                { label: "Новинок", value: String(newGames.length), icon: "Sparkles", color: "text-pink-400" },
                { label: "В избранном", value: String(favorites.length), icon: "Heart", color: "text-yellow-400" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-5 text-center hover:border-purple-500/30 transition-all">
                  <Icon name={s.icon} size={28} className={`${s.color} mx-auto mb-2`} fallback="CircleAlert" />
                  <div className={`font-oswald text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-muted-foreground text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-oswald text-2xl font-bold text-white">🔥 Все игры</h2>
                <button onClick={() => setActiveTab("catalog")} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  Смотреть все <Icon name="ChevronRight" size={16} />
                </button>
              </div>
              {loading ? <LoadingGrid /> : games.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {games.slice(0, 4).map((game) => <GameCard key={game.id} game={game} />)}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                  <Icon name="Gamepad2" size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground mb-4">Игры ещё не добавлены</p>
                  <button onClick={() => setActiveTab("admin")} className="neon-btn text-white font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 text-sm">
                    <Icon name="Plus" size={16} />
                    Добавить первую игру
                  </button>
                </div>
              )}
            </div>

            {newGames.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-oswald text-2xl font-bold text-white">⚡ Новинки</h2>
                  <button onClick={() => setActiveTab("new")} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    Все новинки <Icon name="ChevronRight" size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {newGames.slice(0, 4).map((game) => <GameCard key={game.id} game={game} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATALOG */}
        {activeTab === "catalog" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="font-oswald text-3xl font-bold text-white mb-2">Каталог игр</h2>
              <p className="text-muted-foreground">{games.length} игр доступно</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedGenre === g
                      ? "neon-border-purple text-purple-400 bg-purple-500/10"
                      : "border-border text-muted-foreground hover:border-purple-500/30 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {loading ? <LoadingGrid /> : filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredGames.map((game) => <GameCard key={game.id} game={game} />)}
              </div>
            ) : (
              <EmptyState icon="Gamepad2" text="Игры не найдены" />
            )}
          </div>
        )}

        {/* NEW */}
        {activeTab === "new" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="font-oswald text-3xl font-bold text-white mb-2"><span className="neon-text-cyan">Новинки</span></h2>
              <p className="text-muted-foreground">Самые свежие игры</p>
            </div>
            {loading ? <LoadingGrid /> : newGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {newGames.map((game) => <GameCard key={game.id} game={game} />)}
              </div>
            ) : (
              <EmptyState icon="Sparkles" text="Новинок пока нет" />
            )}
          </div>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="font-oswald text-3xl font-bold text-white mb-6">Поиск игр</h2>
              <div className="relative max-w-xl">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Название игры или жанр..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-muted-foreground focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all text-lg"
                />
              </div>
            </div>
            {searchQuery ? (
              <div>
                <p className="text-muted-foreground mb-6 text-sm">Найдено: <span className="text-white font-semibold">{filteredGames.length}</span></p>
                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {filteredGames.map((game) => <GameCard key={game.id} game={game} />)}
                  </div>
                ) : (
                  <EmptyState icon="SearchX" text={`По запросу «${searchQuery}» ничего не найдено`} />
                )}
              </div>
            ) : (
              <EmptyState icon="Search" text="Начни вводить название игры" />
            )}
          </div>
        )}

        {/* FAVORITES */}
        {activeTab === "favorites" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="font-oswald text-3xl font-bold text-white mb-2"><span className="neon-text-purple">Избранное</span></h2>
              <p className="text-muted-foreground">{favoriteGames.length > 0 ? `${favoriteGames.length} игр` : "Пусто"}</p>
            </div>
            {favoriteGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {favoriteGames.map((game) => <GameCard key={game.id} game={game} />)}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6">
                  <Icon name="Heart" size={36} className="text-muted-foreground" />
                </div>
                <h3 className="font-oswald text-2xl text-white mb-2">Пока пусто</h3>
                <p className="text-muted-foreground mb-6">Нажми на ❤️ на карточке игры</p>
                <button onClick={() => setActiveTab("catalog")} className="neon-btn text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2">
                  <Icon name="Grid3x3" size={18} />
                  Перейти в каталог
                </button>
              </div>
            )}
          </div>
        )}

        {/* ADMIN */}
        {activeTab === "admin" && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="font-oswald text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Icon name="Settings" size={28} className="text-yellow-400" />
                Админ-панель
              </h2>
              <p className="text-muted-foreground">Добавление и управление играми</p>
            </div>

            {!adminAuth ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Icon name="Lock" size={40} className="mx-auto mb-4 text-yellow-400" />
                <h3 className="font-oswald text-xl text-white mb-6">Введи пароль для доступа</h3>
                <div className="flex gap-3 max-w-sm mx-auto">
                  <input
                    type="password"
                    placeholder="Пароль..."
                    value={adminPass}
                    onChange={(e) => { setAdminPass(e.target.value); setAdminPassErr(false); }}
                    onKeyDown={(e) => e.key === "Enter" && (adminPass === ADMIN_PASSWORD ? setAdminAuth(true) : setAdminPassErr(true))}
                    className={`flex-1 bg-background border rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none transition-all ${adminPassErr ? "border-red-500" : "border-border focus:border-yellow-500/60"}`}
                  />
                  <button
                    onClick={() => adminPass === ADMIN_PASSWORD ? setAdminAuth(true) : setAdminPassErr(true)}
                    className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-all"
                  >
                    Войти
                  </button>
                </div>
                {adminPassErr && <p className="text-red-400 text-sm mt-3">Неверный пароль</p>}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-oswald text-xl text-white mb-6 flex items-center gap-2">
                    <Icon name="Plus" size={20} className="text-purple-400" />
                    Добавить игру
                  </h3>

                  {uploadSuccess && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400">
                      <Icon name="CheckCircle" size={18} />
                      Игра успешно добавлена!
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Обложка игры</label>
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition-all"
                      >
                        {coverPreview ? (
                          <img src={coverPreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                        ) : (
                          <div className="text-muted-foreground">
                            <Icon name="ImagePlus" size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Нажми чтобы загрузить обложку</p>
                          </div>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Название *</label>
                        <input
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="Shadow Nexus"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:border-purple-500/60 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Жанр *</label>
                        <select
                          value={form.genre}
                          onChange={(e) => setForm({ ...form, genre: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/60 transition-all"
                        >
                          {GENRES.filter(g => g !== "Все").map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Размер</label>
                        <input
                          value={form.size}
                          onChange={(e) => setForm({ ...form, size: e.target.value })}
                          placeholder="45 ГБ"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:border-purple-500/60 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Рейтинг</label>
                        <input
                          type="number" min="0" max="10" step="0.1"
                          value={form.rating}
                          onChange={(e) => setForm({ ...form, rating: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/60 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Год</label>
                        <input
                          type="number"
                          value={form.year}
                          onChange={(e) => setForm({ ...form, year: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/60 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Тег</label>
                        <select
                          value={form.tag}
                          onChange={(e) => setForm({ ...form, tag: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/60 transition-all"
                        >
                          <option value="">Без тега</option>
                          <option value="Хит">Хит</option>
                          <option value="Новинка">Новинка</option>
                          <option value="Топ">Топ</option>
                          <option value="Инди">Инди</option>
                        </select>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div
                            onClick={() => setForm({ ...form, is_new: !form.is_new })}
                            className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${form.is_new ? "bg-purple-500" : "bg-muted"}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${form.is_new ? "left-6" : "left-0.5"}`} />
                          </div>
                          <span className="text-sm text-muted-foreground">Новинка</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Описание</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Краткое описание игры..."
                        rows={3}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:border-purple-500/60 transition-all resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={uploading || !form.title || !form.genre}
                      className="w-full neon-btn text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <><Icon name="Loader2" size={18} className="animate-spin" /> Загружаю...</>
                      ) : (
                        <><Icon name="Plus" size={18} /> Добавить игру</>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-oswald text-xl text-white mb-4 flex items-center gap-2">
                    <Icon name="List" size={20} className="text-cyan-400" />
                    Все игры ({games.length})
                  </h3>
                  {games.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {games.map((game) => <GameCard key={game.id} game={game} isAdmin />)}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">Игры ещё не добавлены</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-oswald font-bold tracking-wider">
            <span className="neon-text-purple">MR.</span>
            <span className="text-white"> GAMES</span>
          </span>
          <p className="text-muted-foreground text-sm">© 2025 Mr. Games — Скачивай бесплатно. Играй с удовольствием.</p>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="hover:text-white cursor-pointer transition-colors">О нас</span>
            <span className="hover:text-white cursor-pointer transition-colors">Контакты</span>
          </div>
        </div>
      </footer>
    </div>
  );
}