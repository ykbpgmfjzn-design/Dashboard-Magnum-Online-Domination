"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

const GOAL_USERS = 60000

type DashboardData = {
  days: number
  dailyDates: string[]
  dailyUsers: number[]
  totalUsers: number
  sessions: number
  newUsers: number
  engagedSessions: number
  avgTime: number
  channels: {
    label: string
    value: number
    users: number
    newUsers: number
    engagementRate: number
  }[]
  channelsTrend: {
    dates: string[]
    series: { label: string; values: number[] }[]
  }
  sources: (string | number)[][]
  pages: (string | number)[][]
}

const translations = {
  ru: {
    brandTitle: "Magnum Estate",
    brandSubtitle: "Трафик и эффективность сайта",
    tabOverview: "CEO Overview",
    tabMarketing: "Marketing",
    tabContent: "Content",
    periodLabel: "Период",
    period30: "Последние 30 дней",
    period90: "Последние 90 дней",
    period365: "Последние 12 месяцев",
    channelLabel: "Канал",
    channelAll: "Все каналы",
    channelOrganic: "Органика",
    channelPaid: "Платный",
    channelSocial: "Соцсети",
    channelDirect: "Прямой",
    channelReferral: "Рефералы",
    languageLabel: "Язык",
    refreshBtn: "Обновить",
    dataStatusLabel: "Источник данных:",
    kpiUsersLabel: "Уникальные пользователи",
    kpiUsersNote: "Цель: 60 000 / мес",
    kpiSessionsLabel: "Сессии",
    kpiSessionsNote: "Отношение:",
    kpiNewUsersLabel: "Новые пользователи",
    kpiNewUsersNote: "Доля:",
    kpiEngagedLabel: "Вовлеченные сессии",
    kpiEngagedNote: "Коэффициент вовлеченности:",
    kpiAvgTimeLabel: "Среднее время",
    kpiAvgTimeNote: "на пользователя",
    kpiGoalLabel: "Прогресс к цели",
    usersTrendTitle: "Динамика пользователей",
    channelsShareTitle: "Доля каналов",
    channelsTrendTitle: "Динамика по каналам",
    channelsTableTitle: "Каналы",
    goalGaugeTitle: "Прогресс к цели",
    topSourcesTitle: "Топ источники",
    topPagesTitle: "Топ страницы",
    problemPagesTitle: "Проблемные страницы",
    insightTitle: "Выявленные закономерности и инсайты",
    insightActionsTitle: "Стратегические рекомендации",
    usersLabel: "Пользователи",
    sourcesHeader: "Источник / Канал",
    pagesHeader: "Страница",
    usersHeader: "Пользователи",
    engagedHeader: "Вовлеченные",
    newUsersHeader: "Новые",
    avgEngagementHeader: "Среднее время вовлеченности",
    engagementRateHeader: "Коэффициент вовлеченности",
    shareHeader: "Доля",
    channelHeader: "Канал",
    remainingLabel: "Осталось",
    forecastLabel: "Прогноз",
    secondsLabel: "сек",
    perMonthLabel: " / мес",
    demoData: "Демо-данные",
    channelLabels: {
      "Organic Search": "Органический поиск",
      "Paid Search": "Платный поиск",
      "Organic Social": "Соцсети (органика)",
      Direct: "Прямой трафик",
      Referral: "Рефералы",
    } as Record<string, string>,
  },
  en: {
    brandTitle: "Magnum Estate",
    brandSubtitle: "Website traffic and performance",
    tabOverview: "CEO Overview",
    tabMarketing: "Marketing",
    tabContent: "Content",
    periodLabel: "Period",
    period30: "Last 30 days",
    period90: "Last 90 days",
    period365: "Last 12 months",
    channelLabel: "Channel",
    channelAll: "All channels",
    channelOrganic: "Organic",
    channelPaid: "Paid",
    channelSocial: "Social",
    channelDirect: "Direct",
    channelReferral: "Referral",
    languageLabel: "Language",
    refreshBtn: "Refresh",
    dataStatusLabel: "Data source:",
    kpiUsersLabel: "Unique users",
    kpiUsersNote: "Goal: 60,000 / month",
    kpiSessionsLabel: "Sessions",
    kpiSessionsNote: "Ratio:",
    kpiNewUsersLabel: "New users",
    kpiNewUsersNote: "Share:",
    kpiEngagedLabel: "Engaged sessions",
    kpiEngagedNote: "Engagement rate:",
    kpiAvgTimeLabel: "Average time",
    kpiAvgTimeNote: "per user",
    kpiGoalLabel: "Goal progress",
    usersTrendTitle: "Users trend",
    channelsShareTitle: "Channel share",
    channelsTrendTitle: "Channel trend",
    channelsTableTitle: "Channels",
    goalGaugeTitle: "Goal progress",
    topSourcesTitle: "Top sources",
    topPagesTitle: "Top pages",
    problemPagesTitle: "Problem pages",
    insightTitle: "Data Insights & Patterns",
    insightActionsTitle: "Strategic Recommendations",
    usersLabel: "Users",
    sourcesHeader: "Source / Medium",
    pagesHeader: "Page path",
    usersHeader: "Users",
    engagedHeader: "Engaged",
    newUsersHeader: "New",
    avgEngagementHeader: "Avg engagement",
    engagementRateHeader: "Engagement rate",
    shareHeader: "Share",
    channelHeader: "Channel",
    remainingLabel: "Remaining",
    forecastLabel: "Forecast",
    secondsLabel: "sec",
    perMonthLabel: " / month",
    demoData: "Demo data",
    channelLabels: {} as Record<string, string>,
  },
}

type Language = "ru" | "en"

function generateMockData(days: number, channel: string): DashboardData {
  const baseUsers = 1200 + Math.random() * 600
  const trend = Math.random() * 8
  const channelMultiplier: Record<string, number> = {
    all: 1,
    organic: 0.42,
    paid: 0.24,
    social: 0.14,
    direct: 0.12,
    referral: 0.08,
  }

  const multiplier = channelMultiplier[channel] || 1
  const dailyDates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - i - 1))
    return d.toISOString().slice(0, 10).replace(/-/g, "")
  })

  const dailyUsers = Array.from({ length: days }, (_, i) => {
    const noise = Math.random() * 120 - 60
    return Math.max(300, (baseUsers + i * trend + noise) * multiplier)
  })

  const totalUsers = dailyUsers.reduce((sum, v) => sum + v, 0)
  const sessions = totalUsers * (1.35 + Math.random() * 0.25)
  const newUsers = totalUsers * (0.48 + Math.random() * 0.08)
  const engagedSessions = sessions * (0.54 + Math.random() * 0.1)
  const avgTime = 82 + Math.random() * 34
  const channels = [
    { label: "Organic Search", value: 0.42, users: totalUsers * 0.42 },
    { label: "Paid Search", value: 0.24, users: totalUsers * 0.24 },
    { label: "Organic Social", value: 0.14, users: totalUsers * 0.14 },
    { label: "Direct", value: 0.12, users: totalUsers * 0.12 },
    { label: "Referral", value: 0.08, users: totalUsers * 0.08 },
  ]

  const channelsWithMetrics = channels.map((ch) => ({
    ...ch,
    newUsers: ch.users * (0.45 + Math.random() * 0.1),
    engagementRate: 0.35 + Math.random() * 0.4,
  }))

  const channelsTrend = {
    dates: dailyDates,
    series: channelsWithMetrics.map((ch) => ({
      label: ch.label,
      values: dailyUsers.map((value) => value * ch.value),
    })),
  }

  const sources = [
    ["google / organic", totalUsers * 0.38, totalUsers * 0.16, 0.57],
    ["yandex / organic", totalUsers * 0.21, totalUsers * 0.11, 0.51],
    ["google / cpc", totalUsers * 0.18, totalUsers * 0.07, 0.46],
    ["instagram / social", totalUsers * 0.1, totalUsers * 0.05, 0.42],
    ["direct / none", totalUsers * 0.07, totalUsers * 0.03, 0.49],
  ]

  const pages = [
    ["/", totalUsers * 0.18, totalUsers * 0.1, 92, 0.53],
    ["/catalog", totalUsers * 0.15, totalUsers * 0.08, 78, 0.49],
    ["/rent", totalUsers * 0.12, totalUsers * 0.05, 64, 0.44],
    ["/buy", totalUsers * 0.1, totalUsers * 0.06, 71, 0.47],
    ["/contacts", totalUsers * 0.06, totalUsers * 0.04, 96, 0.61],
  ]

  return {
    days,
    dailyDates,
    dailyUsers,
    totalUsers,
    sessions,
    newUsers,
    engagedSessions,
    avgTime,
    channels: channelsWithMetrics,
    channelsTrend,
    sources,
    pages,
  }
}

export default function Dashboard() {
  const [language, setLanguage] = useState<Language>("ru")
  const [days, setDays] = useState(90)
  const [channel, setChannel] = useState("all")
  const [activePage, setActivePage] = useState("overview")
  const [data, setData] = useState<DashboardData | null>(null)

  const usersChartRef = useRef<HTMLCanvasElement>(null)
  const channelsChartRef = useRef<HTMLCanvasElement>(null)
  const channelsTrendChartRef = useRef<HTMLCanvasElement>(null)
  const goalGaugeChartRef = useRef<HTMLCanvasElement>(null)

  const usersChartInstance = useRef<Chart | null>(null)
  const channelsChartInstance = useRef<Chart | null>(null)
  const channelsTrendChartInstance = useRef<Chart | null>(null)
  const goalGaugeChartInstance = useRef<Chart | null>(null)

  const t = useCallback(
    (key: keyof (typeof translations)["ru"]) => {
      return translations[language]?.[key] || translations.ru[key] || key
    },
    [language]
  )

  const localizeChannelLabel = useCallback(
    (label: string) => {
      if (language === "en") return label
      return translations.ru.channelLabels[label] || label
    },
    [language]
  )

  const formatNumber = useCallback(
    (value: number | null | undefined) => {
      const safeValue = Number.isFinite(Number(value)) ? Number(value) : null
      if (safeValue === null) return "—"
      return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US").format(
        Math.round(safeValue)
      )
    },
    [language]
  )

  const formatPercent = useCallback((value: number | null | undefined) => {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : null
    if (safeValue === null) return "—"
    return `${Math.round(safeValue * 100)}%`
  }, [])

  const loadData = useCallback(() => {
    const mockData = generateMockData(days, channel)
    setData(mockData)
  }, [days, channel])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Render charts
  useEffect(() => {
    if (!data) return

    // Users Chart
    if (usersChartRef.current) {
      if (usersChartInstance.current) {
        usersChartInstance.current.destroy()
      }

      const labels = data.dailyDates.map((d) =>
        `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
      )
      const userSeries = data.dailyUsers.map((value) => Math.round(value))

      usersChartInstance.current = new Chart(usersChartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: t("usersLabel") as string,
              data: userSeries,
              borderColor: "#2251ff",
              backgroundColor: "rgba(34, 81, 255, 0.1)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: { display: false },
            y: { grid: { color: "#eef2f8" } },
          },
        },
      })
    }

    // Channels Chart
    if (channelsChartRef.current) {
      if (channelsChartInstance.current) {
        channelsChartInstance.current.destroy()
      }

      channelsChartInstance.current = new Chart(channelsChartRef.current, {
        type: "doughnut",
        data: {
          labels: data.channels.map((c) => localizeChannelLabel(c.label)),
          datasets: [
            {
              data: data.channels.map((c) => Math.round(c.value * 100)),
              backgroundColor: [
                "#2251ff",
                "#47d1ff",
                "#ffb547",
                "#7c5cff",
                "#2fd1a6",
              ],
            },
          ],
        },
        options: {
          plugins: {
            legend: { position: "bottom" },
          },
          cutout: "65%",
        },
      })
    }

    // Channels Trend Chart
    if (channelsTrendChartRef.current) {
      if (channelsTrendChartInstance.current) {
        channelsTrendChartInstance.current.destroy()
      }

      const colors = ["#2251ff", "#47d1ff", "#ffb547", "#7c5cff", "#2fd1a6"]
      const trendLabels = data.channelsTrend.dates.map((d) =>
        `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
      )

      channelsTrendChartInstance.current = new Chart(
        channelsTrendChartRef.current,
        {
          type: "bar",
          data: {
            labels: trendLabels,
            datasets: data.channelsTrend.series.map((s, i) => ({
              label: localizeChannelLabel(s.label),
              data: s.values.map((v) => Math.round(v)),
              backgroundColor: colors[i % colors.length],
            })),
          },
          options: {
            plugins: {
              legend: { position: "bottom" },
            },
            scales: {
              x: { stacked: true, display: false },
              y: { stacked: true, grid: { color: "#eef2f8" } },
            },
          },
        }
      )
    }

    // Goal Gauge Chart
    if (goalGaugeChartRef.current) {
      if (goalGaugeChartInstance.current) {
        goalGaugeChartInstance.current.destroy()
      }

      const progress = data.totalUsers / GOAL_USERS

      goalGaugeChartInstance.current = new Chart(goalGaugeChartRef.current, {
        type: "doughnut",
        data: {
          labels: [t("kpiGoalLabel") as string, t("remainingLabel") as string],
          datasets: [
            {
              data: [Math.min(progress, 1), Math.max(1 - progress, 0)],
              backgroundColor: ["#2251ff", "#eef2f8"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          cutout: "75%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        },
      })
    }

    return () => {
      usersChartInstance.current?.destroy()
      channelsChartInstance.current?.destroy()
      channelsTrendChartInstance.current?.destroy()
      goalGaugeChartInstance.current?.destroy()
    }
  }, [data, t, localizeChannelLabel])

  const buildInsightSummary = useCallback(
    (data: DashboardData) => {
      if (!data || !data.totalUsers || !data.dailyUsers) return "—"

      const daily = data.dailyUsers
      const avg = data.totalUsers / data.days

      let maxVal = -1,
        minVal = Infinity
      let maxDay = 0,
        minDay = 0

      daily.forEach((val, i) => {
        if (val > maxVal) {
          maxVal = val
          maxDay = i
        }
        if (val < minVal) {
          minVal = val
          minDay = i
        }
      })

      const volatility = (maxVal - minVal) / avg

      if (language === "ru") {
        let trendText = `Средняя посещаемость — ${formatNumber(avg)} чел./день. `
        trendText += `Пик активности зафиксирован на ${maxDay + 1}-й день периода (${formatNumber(maxVal)} чел.), `
        trendText += `а спад — на ${minDay + 1}-й день (${formatNumber(minVal)} чел.). `

        if (volatility > 0.5) {
          trendText +=
            "Наблюдается высокая волатильность трафика, что характерно для активных рекламных кампаний или сезонных всплесков."
        } else {
          trendText +=
            "Трафик стабилен, без резких колебаний, что указывает на органический рост или постоянную работу каналов."
        }
        return trendText
      }

      let trendText = `Average daily traffic is ${formatNumber(avg)} users. `
      trendText += `Peak activity was on day ${maxDay + 1} (${formatNumber(maxVal)} users), `
      trendText += `while the lowest was on day ${minDay + 1} (${formatNumber(minVal)} users). `

      if (volatility > 0.5) {
        trendText +=
          "High traffic volatility detected, typical for active ad campaigns or seasonal spikes."
      } else {
        trendText +=
          "Traffic is stable with no sharp fluctuations, indicating organic growth or consistent channel performance."
      }
      return trendText
    },
    [language, formatNumber]
  )

  const buildInsightActions = useCallback(() => {
    if (language === "ru") {
      return [
        "Синхронизация с пиками: рекомендуется планировать запуск рассылок и новых постов за 24 часа до выявленных пиков активности для усиления эффекта.",
        "Анализ провалов: если спады приходятся на выходные, стоит рассмотреть 'поддерживающий' контент или ретаргетинг для выравнивания недельной воронки.",
        "Связь с источниками: сопоставьте дни максимального трафика с графиком выхода рекламы или публикаций в соцсетях для определения самого дешевого 'дня-лида'.",
      ]
    }
    return [
      "Peak Synchronization: Schedule newsletters and new posts 24 hours before identified activity peaks to maximize impact.",
      "Drip Analysis: If slumps occur on weekends, consider 'nurturing' content or retargeting to balance the weekly funnel.",
      "Source Correlation: Match peak traffic days with your ad schedule or social media posts to identify the most cost-effective conversion days.",
    ]
  }, [language])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="text-lg text-[#6b7a90]">Loading...</div>
      </div>
    )
  }

  const progress = data.totalUsers / GOAL_USERS
  const sessionsPerUser = data.sessions / data.totalUsers
  const newUsersShare = data.newUsers / data.totalUsers
  const engagementRate = data.engagedSessions / data.sessions
  const monthlyForecast = Math.round((data.totalUsers / data.days) * 30)

  return (
    <div className="min-h-screen bg-[#f5f7fb] font-sans text-[#0f1a2a]">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-[#e5eaf1] bg-white px-7 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#122347] text-lg font-bold text-white">
            M
          </div>
          <div>
            <div className="text-lg font-bold">{t("brandTitle")}</div>
            <div className="text-xs text-[#6b7a90]">{t("brandSubtitle")}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-xs text-[#6b7a90]">
            <span>{t("periodLabel")}</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="min-w-[160px] rounded-lg border border-[#d7dee9] bg-white px-2.5 py-2"
            >
              <option value={30}>{t("period30")}</option>
              <option value={90}>{t("period90")}</option>
              <option value={365}>{t("period365")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-[#6b7a90]">
            <span>{t("channelLabel")}</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="min-w-[160px] rounded-lg border border-[#d7dee9] bg-white px-2.5 py-2"
            >
              <option value="all">{t("channelAll")}</option>
              <option value="organic">{t("channelOrganic")}</option>
              <option value="paid">{t("channelPaid")}</option>
              <option value="social">{t("channelSocial")}</option>
              <option value="direct">{t("channelDirect")}</option>
              <option value="referral">{t("channelReferral")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-[#6b7a90]">
            <span>{t("languageLabel")}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="min-w-[120px] rounded-lg border border-[#d7dee9] bg-white px-2.5 py-2"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </label>
          <button
            onClick={loadData}
            className="cursor-pointer rounded-xl border-none bg-[#2251ff] px-4 py-2.5 font-semibold text-white"
          >
            {t("refreshBtn")}
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1280px] flex-col gap-5 p-6">
        {/* Data Status */}
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e5eaf1] bg-white px-3 py-2 text-xs text-[#6b7a90]">
          <span>{t("dataStatusLabel")}</span>
          <span>{t("demoData")}</span>
        </div>

        {/* Page Tabs */}
        <nav className="flex flex-wrap gap-2.5 rounded-2xl border border-[#e5eaf1] bg-white p-2">
          {["overview", "marketing", "content"].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`cursor-pointer rounded-xl border-none px-4 py-2.5 font-semibold ${
                activePage === page
                  ? "bg-[#2251ff] text-white"
                  : "bg-transparent text-[#6b7a90]"
              }`}
            >
              {t(`tab${page.charAt(0).toUpperCase() + page.slice(1)}` as keyof (typeof translations)["ru"])}
            </button>
          ))}
        </nav>

        {/* Overview Page */}
        {activePage === "overview" && (
          <div className="flex flex-col gap-5">
            {/* KPIs */}
            <section className="grid grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-12">
              <div className="col-span-1 flex flex-col gap-1.5 rounded-2xl border border-[#e5eaf1] bg-white p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-[#6b7a90]">
                  {t("kpiUsersLabel")}
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(data.totalUsers)}
                </div>
                <div className="text-xs text-[#6b7a90]">{t("kpiUsersNote")}</div>
              </div>
              <div className="col-span-1 flex flex-col gap-1.5 rounded-2xl border border-[#e5eaf1] bg-white p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-[#6b7a90]">
                  {t("kpiSessionsLabel")}
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(data.sessions)}
                </div>
                <div className="text-xs text-[#6b7a90]">
                  {t("kpiSessionsNote")} {sessionsPerUser.toFixed(2)}
                </div>
              </div>
              <div className="col-span-1 flex flex-col gap-1.5 rounded-2xl border border-[#e5eaf1] bg-white p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-[#6b7a90]">
                  {t("kpiNewUsersLabel")}
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(data.newUsers)}
                </div>
                <div className="text-xs text-[#6b7a90]">
                  {t("kpiNewUsersNote")} {formatPercent(newUsersShare)}
                </div>
              </div>
              <div className="col-span-1 flex flex-col gap-1.5 rounded-2xl border border-[#e5eaf1] bg-white p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-[#6b7a90]">
                  {t("kpiEngagedLabel")}
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(data.engagedSessions)}
                </div>
                <div className="text-xs text-[#6b7a90]">
                  {t("kpiEngagedNote")} {formatPercent(engagementRate)}
                </div>
              </div>
              <div className="col-span-1 flex flex-col gap-1.5 rounded-2xl border border-[#e5eaf1] bg-white p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-[#6b7a90]">
                  {t("kpiAvgTimeLabel")}
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(data.avgTime)} {t("secondsLabel")}
                </div>
                <div className="text-xs text-[#6b7a90]">{t("kpiAvgTimeNote")}</div>
              </div>
              <div className="col-span-2 flex flex-col gap-1.5 rounded-2xl border border-[#e5eaf1] bg-white p-4 md:col-span-4 lg:col-span-4">
                <div className="text-xs uppercase tracking-wider text-[#6b7a90]">
                  {t("kpiGoalLabel")}
                </div>
                <div className="text-2xl font-bold">{formatPercent(progress)}</div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#eef2f8]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2251ff] to-[#47d1ff] transition-all duration-400"
                    style={{ width: `${Math.min(progress * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-[#6b7a90]">
                  {t("forecastLabel")}: {formatNumber(monthlyForecast)}
                  {t("perMonthLabel")}
                </div>
              </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-12 gap-4">
              <div className="col-span-12 rounded-2xl border border-[#e5eaf1] bg-white p-4 lg:col-span-8">
                <div className="mb-3 text-sm font-semibold">
                  {t("usersTrendTitle")}
                </div>
                <canvas ref={usersChartRef} height={140} />
              </div>
              <div className="col-span-12 rounded-2xl border border-[#e5eaf1] bg-white p-4 lg:col-span-4">
                <div className="mb-3 text-sm font-semibold">
                  {t("goalGaugeTitle")}
                </div>
                <canvas ref={goalGaugeChartRef} height={180} />
              </div>
              <div className="col-span-12 rounded-2xl border border-[#e5eaf1] bg-white p-4">
                <div className="mb-3 text-sm font-semibold">
                  {t("channelsTableTitle")}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-5 rounded-xl bg-transparent px-2.5 py-2 text-xs font-semibold text-[#6b7a90]">
                    <div>{t("channelHeader")}</div>
                    <div>{t("usersHeader")}</div>
                    <div>{t("shareHeader")}</div>
                    <div>{t("engagementRateHeader")}</div>
                    <div>{t("newUsersHeader")}</div>
                  </div>
                  {data.channels.map((ch) => (
                    <div
                      key={ch.label}
                      className="grid grid-cols-5 rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-sm"
                    >
                      <div className="truncate">{localizeChannelLabel(ch.label)}</div>
                      <div>{formatNumber(ch.users)}</div>
                      <div>{formatPercent(ch.value)}</div>
                      <div>{formatPercent(ch.engagementRate)}</div>
                      <div>{formatNumber(ch.newUsers)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Marketing Page */}
        {activePage === "marketing" && (
          <div className="flex flex-col gap-5">
            <section className="grid grid-cols-12 gap-4">
              <div className="col-span-12 rounded-2xl border border-[#e5eaf1] bg-white p-4 lg:col-span-6">
                <div className="mb-3 text-sm font-semibold">
                  {t("topSourcesTitle")}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-4 rounded-xl bg-transparent px-2.5 py-2 text-xs font-semibold text-[#6b7a90]">
                    <div>{t("sourcesHeader")}</div>
                    <div>{t("usersHeader")}</div>
                    <div>{t("engagedHeader")}</div>
                    <div>{t("engagementRateHeader")}</div>
                  </div>
                  {data.sources.map((s, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-4 rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-sm"
                    >
                      <div className="truncate">{s[0]}</div>
                      <div>{formatNumber(s[1] as number)}</div>
                      <div>{formatNumber(s[2] as number)}</div>
                      <div>{formatPercent(s[3] as number)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-12 rounded-2xl border border-[#e5eaf1] bg-white p-4 lg:col-span-6">
                <div className="mb-3 text-sm font-semibold">
                  {t("channelsShareTitle")}
                </div>
                <canvas ref={channelsChartRef} height={180} />
              </div>
              <div className="col-span-12 rounded-2xl border border-[#e5eaf1] bg-white p-4">
                <div className="mb-3 text-sm font-semibold">
                  {t("channelsTrendTitle")}
                </div>
                <canvas ref={channelsTrendChartRef} height={170} />
              </div>
            </section>
          </div>
        )}

        {/* Content Page */}
        {activePage === "content" && (
          <div className="flex flex-col gap-5">
            <section className="grid grid-cols-12 gap-4">
              <div className="col-span-12 rounded-2xl border border-[#e5eaf1] bg-white p-4">
                <div className="mb-3 text-sm font-semibold">
                  {t("topPagesTitle")}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-4 rounded-xl bg-transparent px-2.5 py-2 text-xs font-semibold text-[#6b7a90]">
                    <div>{t("pagesHeader")}</div>
                    <div>{t("usersHeader")}</div>
                    <div>{t("engagedHeader")}</div>
                    <div>{t("avgEngagementHeader")}</div>
                  </div>
                  {data.pages.map((p, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-4 rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-sm"
                    >
                      <div className="truncate">{p[0]}</div>
                      <div>{formatNumber(p[1] as number)}</div>
                      <div>{formatNumber(p[2] as number)}</div>
                      <div>
                        {Math.round(p[3] as number)} {t("secondsLabel")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-12 rounded-2xl border border-[#e5eaf1] bg-white p-4">
                <div className="rounded-xl border border-[#e5eaf1] bg-[#f7f9fc] p-3.5">
                  <div className="mb-2 text-sm font-semibold">
                    {t("insightTitle")}
                  </div>
                  <p className="text-sm leading-relaxed text-[#6b7a90]">
                    {buildInsightSummary(data)}
                  </p>
                  <div className="mb-2 mt-4 text-sm font-semibold">
                    {t("insightActionsTitle")}
                  </div>
                  <ol className="m-0 list-decimal pl-5 text-sm leading-relaxed text-[#0f1a2a]">
                    {buildInsightActions().map((action, i) => (
                      <li key={i} className="mb-1.5">
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
