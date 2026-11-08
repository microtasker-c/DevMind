import { Button, Card } from "@heroui/react";
import { staffPicks, topics } from "./home-data";
import { Icon } from "./icons";

export function RightRail() {
  return (
    <aside className="space-y-7">
      <Card className="border-divider bg-surface p-5 shadow-none">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">编辑精选</h2>
          <Icon name="spark" size={18} />
        </div>
        <div className="mt-5 space-y-5">
          {staffPicks.map((pick, index) => (
            <article key={pick.title}>
              <p className="text-xs font-medium text-accent">
                0{index + 1} · {pick.date}
              </p>
              <h3 className="mt-1 font-medium leading-6 text-foreground">{pick.title}</h3>
              <p className="mt-1 text-xs text-muted">{pick.author}</p>
            </article>
          ))}
        </div>
        <Button className="mt-5 px-0 text-accent" variant="ghost">
          查看全部 <Icon name="arrow" size={15} />
        </Button>
      </Card>
      <div>
        <h2 className="font-semibold text-foreground">热门主题</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Button
              key={topic}
              className="h-8 rounded-full border-divider px-3 text-xs text-muted"
              variant="outline"
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>
      <div className="border-t border-divider pt-5 text-xs leading-5 text-muted">
        关于 Dev-Mind　帮助　隐私
        <br />© 2026 Dev-Mind Community
      </div>
    </aside>
  );
}
