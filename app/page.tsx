"use client"

import { useState, useEffect, useCallback } from "react"

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
    channelsTableTitle: "Каналы",
    goalGaugeTitle: "Прогресс к цели",
    topSourcesTitle: "Топ источники",
    topPagesTitle: "Топ страницы",
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
    channelsTableTitle: "Channels",
    goalGaugeTitle: "Goal progress",
    topSourcesTitle: "Top sources",
    topPagesTitle: "Top pages",
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
    sources,
    pages,
  }
}

// Simple SVG-based charts
function LineChart({ data, height = 200 }: { data: number[]; height?: number }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 100
  const padding = 5

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((v - min) / range) * (height - 2 * padding)
      return `${x},${y}`
    })
    .join(" ")

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
      <polygon points={areaPoints} fill="rgba(34, 81, 255, 0.1)" />
      <polyline points={points} fill="none" stroke="#2251ff" strokeWidth="1.5" />
    </svg>
  )
}

function DonutChart({
  data,
  labels,
  colors,
  size = 180,
}: {
  data: number[]
  labels: string[]
  colors: string[]
  size?: number
}) {
  const total = data.reduce((a, b) => a + b, 0)
  const radius = 40
  const strokeWidth = 15
  let currentAngle = -90

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {data.map((value, i) => {
          const percentage = value / total
          const angle = percentage * 360
          const startAngle = currentAngle
          currentAngle += angle

          const startRad = (startAngle * Math.PI) / 180
          const endRad = ((startAngle + angle) * Math.PI) / 180

          const x1 = 50 + radius * Math.cos(startRad)
          const y1 = 50 + radius * Math.sin(startRad)
          const x2 = 50 + radius * Math.cos(endRad)
          const y2 = 50 + radius * Math.sin(endRad)

          const largeArc = angle > 180 ? 1 : 0

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={colors[i]}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-3">
        {labels.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
            <span className="text-[#6b7a90]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GaugeChart({ progress, size = 160 }: { progress: number; size?: number }) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const radius = 35
  const strokeWidth = 10
  const circumference = Math.PI * radius
  const progressOffset = circumference * (1 - clampedProgress)

  return (
    <svg width={size} height={size / 2 + 20} viewBox="0 0 100 60">
      <path
        d={`M 15 50 A 35 35 0 0 1 85 50`}
        fill="none"
        stroke="#eef2f8"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d={`M 15 50 A 35 35 0 0 1 85 50`}
        fill="none"
        stroke="#2251ff"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset}
      />
      <text x="50" y="45" textAnchor="middle" className="fill-[#0f1a2a] text-lg font-bold" fontSize="14">
        {Math.round(clampedProgress * 100)}%
      </text>
    </svg>
  )
}

export default function Dashboard() {
  const [language, setLanguage] = useState<Language>("ru")
  const [days, setDays] = useState(90)
  const [channel, setChannel] = useState("all")
  const [data, setData] = useState<DashboardData | null>(null)

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
      return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US").format(Math.round(safeValue))
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
        trendText += "High traffic volatility detected, typical for active ad campaigns or seasonal spikes."
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

  const channelColors = ["#2251ff", "#47d1ff", "#ffb547", "#7c5cff", "#2fd1a6"]

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
        <div className="inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-1.5 text-xs text-yellow-700">
          <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
          {t("dataStatusLabel")} {t("demoData")}
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs text-[#6b7a90]">{t("kpiUsersLabel")}</div>
            <div className="text-2xl font-bold">{formatNumber(data.totalUsers)}</div>
            <div className="mt-1 text-xs text-[#6b7a90]">{t("kpiUsersNote")}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs text-[#6b7a90]">{t("kpiSessionsLabel")}</div>
            <div className="text-2xl font-bold">{formatNumber(data.sessions)}</div>
            <div className="mt-1 text-xs text-[#6b7a90]">
              {t("kpiSessionsNote")} {sessionsPerUser.toFixed(2)}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs text-[#6b7a90]">{t("kpiNewUsersLabel")}</div>
            <div className="text-2xl font-bold">{formatNumber(data.newUsers)}</div>
            <div className="mt-1 text-xs text-[#6b7a90]">
              {t("kpiNewUsersNote")} {formatPercent(newUsersShare)}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs text-[#6b7a90]">{t("kpiEngagedLabel")}</div>
            <div className="text-2xl font-bold">{formatNumber(data.engagedSessions)}</div>
            <div className="mt-1 text-xs text-[#6b7a90]">
              {t("kpiEngagedNote")} {formatPercent(engagementRate)}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs text-[#6b7a90]">{t("kpiAvgTimeLabel")}</div>
            <div className="text-2xl font-bold">
              {Math.round(data.avgTime)} {t("secondsLabel")}
            </div>
            <div className="mt-1 text-xs text-[#6b7a90]">{t("kpiAvgTimeNote")}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-1 text-xs text-[#6b7a90]">{t("forecastLabel")}</div>
            <div className="text-2xl font-bold">{formatNumber(monthlyForecast)}</div>
            <div className="mt-1 text-xs text-[#6b7a90]">{t("perMonthLabel")}</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Users Trend Chart */}
          <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold">{t("usersTrendTitle")}</h3>
            <div className="h-[200px]">
              <LineChart data={data.dailyUsers} height={200} />
            </div>
          </div>

          {/* Goal Gauge */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">{t("goalGaugeTitle")}</h3>
            <div className="flex flex-col items-center justify-center">
              <GaugeChart progress={progress} size={180} />
              <div className="mt-2 text-center">
                <div className="text-lg font-bold">{formatNumber(data.totalUsers)}</div>
                <div className="text-xs text-[#6b7a90]">
                  {t("remainingLabel")}: {formatNumber(Math.max(0, GOAL_USERS - data.totalUsers))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Channels Section */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Channels Donut */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">{t("channelsShareTitle")}</h3>
            <div className="flex justify-center py-4">
              <DonutChart
                data={data.channels.map((c) => c.value * 100)}
                labels={data.channels.map((c) => localizeChannelLabel(c.label))}
                colors={channelColors}
              />
            </div>
          </div>

          {/* Channels Table */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">{t("channelsTableTitle")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5eaf1] text-left text-xs text-[#6b7a90]">
                    <th className="pb-2 font-medium">{t("channelHeader")}</th>
                    <th className="pb-2 font-medium">{t("usersHeader")}</th>
                    <th className="pb-2 font-medium">{t("shareHeader")}</th>
                    <th className="pb-2 font-medium">{t("engagementRateHeader")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.channels.map((ch, i) => (
                    <tr key={i} className="border-b border-[#f0f3f7]">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: channelColors[i] }}
                          />
                          {localizeChannelLabel(ch.label)}
                        </div>
                      </td>
                      <td className="py-2.5">{formatNumber(ch.users)}</td>
                      <td className="py-2.5">{formatPercent(ch.value)}</td>
                      <td className="py-2.5">{formatPercent(ch.engagementRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Sources & Pages */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Top Sources */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">{t("topSourcesTitle")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5eaf1] text-left text-xs text-[#6b7a90]">
                    <th className="pb-2 font-medium">{t("sourcesHeader")}</th>
                    <th className="pb-2 font-medium">{t("usersHeader")}</th>
                    <th className="pb-2 font-medium">{t("engagedHeader")}</th>
                    <th className="pb-2 font-medium">{t("engagementRateHeader")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sources.map((row, i) => (
                    <tr key={i} className="border-b border-[#f0f3f7]">
                      <td className="py-2.5 font-medium">{row[0]}</td>
                      <td className="py-2.5">{formatNumber(row[1] as number)}</td>
                      <td className="py-2.5">{formatNumber(row[2] as number)}</td>
                      <td className="py-2.5">{formatPercent(row[3] as number)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Pages */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">{t("topPagesTitle")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5eaf1] text-left text-xs text-[#6b7a90]">
                    <th className="pb-2 font-medium">{t("pagesHeader")}</th>
                    <th className="pb-2 font-medium">{t("usersHeader")}</th>
                    <th className="pb-2 font-medium">{t("engagedHeader")}</th>
                    <th className="pb-2 font-medium">{t("avgEngagementHeader")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pages.map((row, i) => (
                    <tr key={i} className="border-b border-[#f0f3f7]">
                      <td className="py-2.5 font-medium">{row[0]}</td>
                      <td className="py-2.5">{formatNumber(row[1] as number)}</td>
                      <td className="py-2.5">{formatNumber(row[2] as number)}</td>
                      <td className="py-2.5">
                        {row[3]} {t("secondsLabel")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">{t("insightTitle")}</h3>
          <p className="mb-6 leading-relaxed text-[#4a5568]">{buildInsightSummary(data)}</p>
          <h4 className="mb-3 text-sm font-semibold">{t("insightActionsTitle")}</h4>
          <ul className="list-inside list-disc space-y-2 text-sm text-[#4a5568]">
            {buildInsightActions().map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
