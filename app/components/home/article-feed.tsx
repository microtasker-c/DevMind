"use client";

import { Button, Card } from "@heroui/react";
import { Article } from "./home-data";
import { Icon } from "./icons";

export function ArticleFeed({ articles }: { articles: Article[] }) {
  return (
    <section aria-label="文章列表" className="min-w-0">
      <div className="mb-7 flex items-end justify-between border-b border-divider pb-4">
        <div>
          <p className="text-sm font-medium text-accent">为你推荐</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            最新洞见
          </h1>
        </div>
        <Button className="text-muted" variant="ghost">
          精选 <Icon name="arrow" size={16} />
        </Button>
      </div>
      <div className="space-y-5">
        {articles.length > 0 ? (
          articles.map((article) => <ArticleCard key={article.id} article={article} />)
        ) : (
          <Card className="border-divider bg-surface p-8 text-center">
            <p className="text-muted">没有找到匹配的文章</p>
          </Card>
        )}
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="group border-divider/80 bg-surface p-5 shadow-none transition-shadow hover:shadow-[0_12px_35px_-18px_var(--accent)] sm:p-6">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
          {article.avatar}
        </span>
        <span className="font-medium text-foreground">{article.author}</span>
        <span>·</span>
        <span>{article.publication}</span>
        <span>·</span>
        <span>{article.date}</span>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_156px] sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
            {article.topic}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
            {article.title}
          </h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted sm:text-base">
            {article.excerpt}
          </p>
        </div>
        <div
          aria-label={`${article.title} 配图`}
          className="aspect-[1.35] rounded-lg"
          style={{ background: article.image }}
        />
      </div>
      <div className="mt-6 flex items-center justify-between text-muted">
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5 text-accent">
            <Icon name="clap" size={17} />
            {article.reactions}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="comment" size={17} />
            {article.comments}
          </span>
          <span>{article.readTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button aria-label="收藏文章" isIconOnly variant="ghost">
            <Icon name="bookmark" size={18} />
          </Button>
          <Button aria-label="更多操作" isIconOnly variant="ghost">
            <Icon name="more" size={19} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
