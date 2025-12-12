"use client";

import { useState } from "react";
import { Gamepad2, Users, Clock, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./GamesSection.module.css";

interface Game {
    id: string;
    title: string;
    description: string;
    players: string;
    duration: string;
    rating: number;
    category: string;
    comingSoon?: boolean;
}

const games: Game[] = [
    {
        id: "1",
        title: "Trivia Challenge",
        description: "Test your knowledge with friends in this fast-paced quiz game",
        players: "2-8",
        duration: "10-15 min",
        rating: 4.8,
        category: "Quiz",
    },
    {
        id: "2",
        title: "Drawing Race",
        description: "Guess what your friends are drawing before time runs out",
        players: "3-12",
        duration: "15-20 min",
        rating: 4.7,
        category: "Drawing",
    },
    {
        id: "3",
        title: "Word Chain",
        description: "Connect words together in this creative word association game",
        players: "2-6",
        duration: "10-15 min",
        rating: 4.5,
        category: "Word",
    },
    {
        id: "4",
        title: "Reaction Race",
        description: "Test your reflexes in this quick-fire reaction game",
        players: "2-8",
        duration: "5-10 min",
        rating: 4.6,
        category: "Action",
        comingSoon: true,
    },
    {
        id: "5",
        title: "Story Builder",
        description: "Create hilarious stories together, one sentence at a time",
        players: "3-10",
        duration: "15-20 min",
        rating: 4.4,
        category: "Creative",
        comingSoon: true,
    },
    {
        id: "6",
        title: "Music Quiz",
        description: "Guess the song from short clips and beat your friends",
        players: "2-8",
        duration: "10-15 min",
        rating: 4.9,
        category: "Music",
        comingSoon: true,
    },
];

export default function GamesSection() {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [filter, setFilter] = useState<string>("all");

    const categories = ["all", ...new Set(games.map((g) => g.category.toLowerCase()))];

    const filteredGames = filter === "all"
        ? games
        : games.filter((g) => g.category.toLowerCase() === filter);

    const handleStartGame = (game: Game) => {
        if (game.comingSoon) return;
        console.log("Starting game:", game.title);
        // TODO: Implement game start logic
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Games</h2>
                    <p className={styles.subtitle}>Play together with everyone in the room</p>
                </div>

                {/* Category Filters */}
                <div className={styles.filters}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`${styles.filterButton} ${filter === cat ? styles.active : ""}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Games Grid */}
            <div className={styles.gamesGrid}>
                {filteredGames.map((game) => (
                    <div
                        key={game.id}
                        className={`${styles.gameCard} ${game.comingSoon ? styles.comingSoon : ""}`}
                        onClick={() => !game.comingSoon && setSelectedGame(game)}
                    >
                        {game.comingSoon && (
                            <div className={styles.comingSoonBadge}>Coming Soon</div>
                        )}

                        <div className={styles.gameIcon}>
                            <Gamepad2 size={28} />
                        </div>

                        <div className={styles.gameInfo}>
                            <h3 className={styles.gameTitle}>{game.title}</h3>
                            <p className={styles.gameDescription}>{game.description}</p>

                            <div className={styles.gameMeta}>
                                <div className={styles.metaItem}>
                                    <Users size={14} />
                                    <span>{game.players} players</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <Clock size={14} />
                                    <span>{game.duration}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <Star size={14} />
                                    <span>{game.rating}</span>
                                </div>
                            </div>
                        </div>

                        {!game.comingSoon && (
                            <Button
                                size="sm"
                                className={styles.playButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartGame(game);
                                }}
                            >
                                <Play size={16} />
                                Play
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Info */}
            <div className={styles.quickInfo}>
                <Gamepad2 size={18} />
                <span>All games are browser-based — no downloads required!</span>
            </div>
        </div>
    );
}
