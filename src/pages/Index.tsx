import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/aa9c31d7-92e1-4021-830d-a2684567d329/files/6f342523-d1b0-45da-bded-6ec860faf02e.jpg";
const GAME_COVER = "https://cdn.poehali.dev/projects/aa9c31d7-92e1-4021-830d-a2684567d329/files/dc02dddf-24e8-4d00-9a14-7843ea28a2d3.jpg";

const GENRES = ["Все", "Экшен", "RPG", "Шутер", "Стратегия", "Гонки", "Хоррор", "Инди"];

const GAMES = [
  { id: 1, title: "Shadow Nexus", genre: "Экшен", size: "45 ГБ", rating: 9.2, downloads: "2.1М", year: 2025, cover: GAME_COVER, isNew: true, tag: "Хит" },
  { id: 2, title: "Void Protocol", genre: "Шутер", size: "32 ГБ", rating: 8.8, downloads: "1.5М", year: 2025, cover: GAME_COVER, isNew: true, tag: "Новинка" },
  { id: 3, title: "Neon Dynasty", genre: "RPG", size: "78 ГБ", rating: 9.5, downloads: "3.2М", year: 2024, cover: GAME_COVER, isNew: false, tag: "Топ" },
  { id: 4, title: "Iron Circuit", genre: "Гонки", size: "18 ГБ", rating: 8.1, downloads: "890К", year: 2025, cover: GAME_COVER, isNew: true, tag: "Новинка" },
  { id: 5, title: "Dark Frontier", genre: "Стратегия", size: "12 ГБ", rating: 8.6, downloads: "1.1М", year: 2024, cover: GAME_COVER, isNew: false, tag: "" },
  { id: 6, title: "Phantom Echo", genre: "Хоррор", size: "28 ГБ", rating: 8.9, downloads: "670К", year: 2025, cover: GAME_COVER, isNew: true, tag: "Хит" },
  { id: 7, title: "Cyber Legends", genre: "RPG", size: "95 ГБ", rating: 9.8, downloads: "5.4М", year: 2024, cover: GAME_COVER, isNew: false, tag: "Топ" },
  { id: 8, title: "Pixel Rebels", genre: "Инди", size: "4 ГБ", rating: 8.3, downloads: "450К", year: 2025, cover: GAME_COVER, isNew: true, tag: "Инди" },
];

type Tab = "home" | "catalog" | "new" | "search" | "favorites";

const tagColors: Record<string, string> = {
  "Хит": "bg-pink-500/20 text-pink-400 border-pink-500/40",
  "Новинка": "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  "Топ": "bg-purple-500/20 text-purple-400 border-purple-500/40",
  "Инди": "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadedId, setDownloadedId] = useState<number | null>(null);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleDownload = (id: number) => {
    setDownloadedId(id);
    setTimeout(() => setDownloadedId(null), 2000);
  };

  const filteredGames = GAMES.filter((g) => {
    const matchGenre = selectedGenre === "Все" || g.genre === selectedGenre;
    const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGenre && matchSearch;
  });

  const newGames = GAMES.filter((g) => g.isNew);
  const favoriteGames = GAMES.filter((g) => favorites.includes(g.id));

  const GameCard = ({ game }: { game: typeof GAMES[0] }) => (
    <div className="card-hover bg-card border border-border rounded-xl overflow-hidden group animate-fade-in">
      <div className="relative">
        <img src={game.cover} alt={game.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {game.tag && (
          <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full border font-semibold ${tagColors[game.tag]}`}>
            {game.tag}
          </span>
        )}
        <button
          onClick={() => toggleFavorite(game.id)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:border-purple-500/60 transition-all"
        >
          <Icon
            name="Heart"
            size={16}
            className={favorites.includes(game.id) ? "fill-pink-500 text-pink-500" : "text-white/60"}
          />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Icon name="Star" size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">{game.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-oswald text-lg font-semibold text-white mb-1 leading-tight">{game.title}</h3>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-muted-foreground">{game.genre}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{game.year}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{game.size}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icon name="Download" size={12} />
            <span>{game.downloads}</span>
          </div>
          <button
            onClick={() => handleDownload(game.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all ${
              downloadedId === game.id
                ? "bg-green-600"
                : "neon-btn"
            }`}
          >
            <Icon name={downloadedId === game.id ? "Check" : "Download"} size={14} />
            {downloadedId === game.id ? "Готово!" : "Скачать"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg neon-btn flex items-center justify-center">
              <Icon name="Gamepad2" size={18} className="text-white" />
            </div>
            <span className="font-oswald text-xl font-bold tracking-wider">
              <span className="neon-text-purple">MR.</span>
              <span className="text-white"> GAMES</span>
            </span>
          </div>

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

          {/* Mobile nav */}
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
                className={`p-2 rounded-lg transition-all ${
                  activeTab === tab.id ? "text-purple-400" : "text-muted-foreground"
                }`}
              >
                <Icon name={tab.icon} size={20} />
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* HOME */}
        {activeTab === "home" && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero */}
            <div className="relative rounded-2xl overflow-hidden min-h-[420px] flex items-end">
              <img src={HERO_IMAGE} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 scanline" />
              <div className="relative z-10 p-8 md:p-12 max-w-2xl animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Онлайн • 12 420 игроков</span>
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Игр в каталоге", value: "12 500+", icon: "Gamepad2", color: "text-purple-400" },
                { label: "Загрузок сегодня", value: "48 200", icon: "Download", color: "text-cyan-400" },
                { label: "Пользователей", value: "1.8М", icon: "Users", color: "text-pink-400" },
                { label: "Новинок в месяц", value: "300+", icon: "Sparkles", color: "text-yellow-400" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-5 text-center hover:border-purple-500/30 transition-all">
                  <Icon name={s.icon} size={28} className={`${s.color} mx-auto mb-2`} />
                  <div className={`font-oswald text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-muted-foreground text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Popular games */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-oswald text-2xl font-bold text-white">
                  <span className="neon-text-purple">🔥</span> Популярное
                </h2>
                <button onClick={() => setActiveTab("catalog")} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  Все игры <Icon name="ChevronRight" size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {GAMES.slice(0, 4).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>

            {/* New releases strip */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-oswald text-2xl font-bold text-white">
                  <span className="neon-text-cyan">⚡</span> Свежие новинки
                </h2>
                <button onClick={() => setActiveTab("new")} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  Все новинки <Icon name="ChevronRight" size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {newGames.slice(0, 4).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CATALOG */}
        {activeTab === "catalog" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="font-oswald text-3xl font-bold text-white mb-2">Каталог игр</h2>
              <p className="text-muted-foreground">Все доступные игры для скачивания</p>
            </div>
            {/* Genre filter */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
            {filteredGames.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Icon name="Gamepad2" size={48} className="mx-auto mb-4 opacity-30" />
                <p>Игры не найдены</p>
              </div>
            )}
          </div>
        )}

        {/* NEW */}
        {activeTab === "new" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="font-oswald text-3xl font-bold text-white mb-2">
                <span className="neon-text-cyan">Новинки</span>
              </h2>
              <p className="text-muted-foreground">Самые свежие игры этого года</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {newGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
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
            {searchQuery && (
              <div>
                <p className="text-muted-foreground mb-6 text-sm">
                  Найдено: <span className="text-white font-semibold">{filteredGames.length}</span> игр
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
                {filteredGames.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" />
                    <p>По запросу «{searchQuery}» ничего не найдено</p>
                  </div>
                )}
              </div>
            )}
            {!searchQuery && (
              <div className="text-center py-20 text-muted-foreground">
                <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
                <p>Начни вводить название игры</p>
              </div>
            )}
          </div>
        )}

        {/* FAVORITES */}
        {activeTab === "favorites" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="font-oswald text-3xl font-bold text-white mb-2">
                <span className="neon-text-purple">Избранное</span>
              </h2>
              <p className="text-muted-foreground">
                {favoriteGames.length > 0
                  ? `${favoriteGames.length} ${favoriteGames.length === 1 ? "игра" : "игры"} в избранном`
                  : "Твоя коллекция пуста"}
              </p>
            </div>
            {favoriteGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {favoriteGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6">
                  <Icon name="Heart" size={36} className="text-muted-foreground" />
                </div>
                <h3 className="font-oswald text-2xl text-white mb-2">Пока пусто</h3>
                <p className="text-muted-foreground mb-6">Нажми на ❤️ на карточке игры, чтобы добавить в избранное</p>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="neon-btn text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2"
                >
                  <Icon name="Grid3x3" size={18} />
                  Перейти в каталог
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-oswald font-bold tracking-wider">
              <span className="neon-text-purple">MR.</span>
              <span className="text-white"> GAMES</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm text-center">
            © 2025 Mr. Games — Скачивай бесплатно. Играй с удовольствием.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="hover:text-white cursor-pointer transition-colors">О нас</span>
            <span className="hover:text-white cursor-pointer transition-colors">Контакты</span>
            <span className="hover:text-white cursor-pointer transition-colors">Правила</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
