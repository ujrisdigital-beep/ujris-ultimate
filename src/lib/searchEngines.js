import { supabase } from '../lib/supabase';

// 5 Specialized Search Engines for UJU Cycle Ultimate

// 1. Academic Search Engine (Research papers, journals, citations)
export async function academicSearch(query, filters = {}) {
  const { discipline, yearFrom, yearTo, peerReviewed, openAccess } = filters;
  const results = { query, engine: 'academic', total: 0, papers: [], citations: [] };
  
  try {
    // PubMed / arXiv / CrossRef API integration
    const sources = [
      // arXiv (physics, math, CS)
      fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=20`).then(r => r.ok ? r.text() : null),
      // CrossRef (DOIs, citations)
      fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=20`).then(r => r.ok ? r.json() : null),
      // Semantic Scholar
      fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=20`, {
        headers: { 'x-api-key': process.env.SEMANTIC_SCHOLAR_KEY || '' }
      }).then(r => r.ok ? r.json() : null),
    ];
    
    const [arxivData, crossrefData, semanticData] = await Promise.all(sources.map(p => p.catch(() => null)));
    
    // Parse arXiv results
    if (arxivData) {
      const entries = arxivData.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      results.papers = entries.map(entry => {
        const title = (entry.match(/<title>(.*?)<\/title>/) || [])[1] || '';
        const summary = (entry.match(/<summary>(.*?)<\/summary>/) || [])[1] || '';
        const published = (entry.match(/<published>(.*?)<\/published>/) || [])[1] || '';
        const authors = (entry.match(/<name>(.*?)<\/name>/g) || []).map(a => (a.match(/<name>(.*?)<\/name>/) || [])[1]);
        const link = (entry.match(/<id>(.*?)<\/id>/) || [])[1] || '';
        
        return { title: cleanText(title), abstract: cleanText(summary), authors, published, link, source: 'arXiv' };
      });
    }
    
    // Parse CrossRef results
    if (crossrefData?.message?.items) {
      results.citations = crossrefData.message.items.map(item => ({
        title: item.title?.[0] || '',
        doi: item.DOI || '',
        authors: item.author?.map(a => `${a.given || ''} ${a.family || ''}`.trim()) || [],
        year: item.created?.['date-parts']?.[0]?.[0] || null,
        citations: item['is-referenced-by-count'] || 0,
        source: 'CrossRef',
      }));
    }
    
    // Parse Semantic Scholar
    if (semanticData?.data) {
      semanticData.data.forEach(paper => {
        results.papers.push({
          title: paper.title,
          abstract: paper.abstract || '',
          authors: paper.authors?.map(a => a.name) || [],
          year: paper.year,
          citations: paper.citationCount || 0,
          influentialCitations: paper.influentialCitationCount || 0,
          link: paper.url,
          source: 'Semantic Scholar',
        });
      });
    }
    
    results.total = results.papers.length + results.citations.length;
    
    // Store search for self-improvement
    logSearch('academic', query, results, true);
    
    return results;
  } catch (e) {
    logSearch('academic', query, null, false, e.message);
    return { error: 'Academic search failed', details: e.message };
  }
}

// 2. Legal Search Engine (Cases, statutes, regulations)
export async function legalSearch(query, filters = {}) {
  const { jurisdiction, court, dateFrom, dateTo, caseStatus } = filters;
  const results = { query, engine: 'legal', total: 0, cases: [], statutes: [], regulations: [] };
  
  try {
    // CourtListener API (US Federal Courts)
    const courtListener = await fetch(
      `https://www.courtlistener.com/api/rest/v3/search/?q=${encodeURIComponent(query)}&format=json&count=20`,
      { headers: { 'Authorization': `Token ${process.env.COURT_LISTENER_KEY || ''}` }
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // Caselaw Access Project (CAP) - Harvard
    const capResults = await fetch(
      `https://api.case.law/v1/cases/?search=${encodeURIComponent(query)}&count=20`,
      { headers: { 'Authorization': `Token ${process.env.CAP_API_KEY || ''}` }
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // UK Tribunal Decisions
    const ukTribunals = await fetch(
      `https://www.gov.uk/api/tribunal-decisions/search?q=${encodeURIComponent(query)}`,
      { headers: { 'Accept': 'application/json' } }
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // Parse CourtListener
    if (courtListener?.results) {
      results.cases = courtListener.results.map(c => ({
        id: c.id,
        caseName: c.caseName || '',
        citation: c.cite || '',
        court: c.court || '',
        dateFiled: c.dateFiled || '',
        status: c.caseIsReopened ? 'Reopened' : 'Closed',
        summary: c.snippet || '',
        url: c.absolute_url || '',
        jurisdiction: 'US Federal',
      }));
    }
    
    // Parse CAP
    if (capResults?.results) {
      capResults.results.forEach(c => {
        results.cases.push({
          id: c.id,
          caseName: c.name || '',
          citation: c.citations?.map(cit => cit.cite).join(', ') || '',
          court: c.court?.name || '',
          dateFiled: c.decision_date || '',
          jurisdiction: 'US State',
          url: `https://case.law/case/${c.id}/`,
        });
      });
    }
    
    // UK Tribunal results
    if (ukTribunals?.decisions) {
      ukTribunals.decisions.forEach(d => {
        results.cases.push({
          id: d.id,
          caseName: d.name || '',
          tribunal: d.tribunal_name || '',
          date: d.decision_date || '',
          summary: d.summary || '',
          jurisdiction: 'UK',
          url: d.legal_url || '',
        });
      });
    }
    
    // Search internal case database (UJRIS)
    const { data: internalCases } = await supabase
      .from('cases')
      .select('*')
      .textSearch('case_title', query)
      .limit(10);
    
    if (internalCases?.length > 0) {
      results.cases.push(...internalCases.map(c => ({
        ...c,
        source: 'UJRIS Internal',
        jurisdiction: 'Internal',
      })));
    }
    
    results.total = results.cases.length;
    logSearch('legal', query, results, true);
    return results;
  } catch (e) {
    logSearch('legal', query, null, false, e.message);
    return { error: 'Legal search failed', details: e.message };
  }
}

// 3. Market Search Engine (Companies, financials, trends)
export async function marketSearch(query, filters = {}) {
  const { sector, region, marketCap, fundingStage } = filters;
  const results = { query, engine: 'market', total: 0, companies: [], trends: [], funding: [] };
  
  try {
    // SEC EDGAR API (US public companies)
    const secData = await fetch(
      `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(query)}&count=20&output=atom`,
      { headers: { 'User-Agent': 'UJU Cycle Ultimate contact@ujris.org' } }
    ).then(r => r.ok ? r.text() : null).catch(() => null);
    
    // Crunchbase (startups, funding)
    const crunchbase = await fetch(
      `https://api.crunchbase.com/v4/data/entities/organizations?name=${encodeURIComponent(query)}&limit=20`,
      { headers: { 'X-cb-user-key': process.env.CRUNCHBASE_KEY || '' } }
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // Google Trends (via SerpAPI or similar)
    const trends = await fetch(
      `https://serpapi.com/search?engine=google_trends&q=${encodeURIComponent(query)}&api_key=${process.env.SERP_API_KEY || ''}`
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // Parse SEC data
    if (secData) {
      const entries = secData.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      results.companies = entries.map(entry => {
        const title = (entry.match(/<title>(.*?)<\/title>/) || [])[1] || '';
        const link = (entry.match(/<link [^>]*href="(.*?)"/) || [])[1] || '';
        const cik = (entry.match(/CIK[:\s]*(\d+)/) || [])[1] || '';
        return { name: cleanText(title), cik, link, source: 'SEC EDGAR', type: 'Public Company' };
      });
    }
    
    // Parse Crunchbase
    if (crunchbase?.entities) {
      results.funding = crunchbase.entities.map(e => ({
        name: e.name || '',
        description: e.short_description || '',
        fundingTotal: e.funding_total || 0,
        stage: e.funding_stage || '',
        employees: e.num_employees || 0,
        location: e.location_identifiers?.[0]?.name || '',
        source: 'Crunchbase',
      }));
    }
    
    // Parse Trends
    if (trends?.interest_over_time) {
      results.trends = trends.interest_over_time.map(point => ({
        date: point.date,
        value: point.value,
        growth: point.growth || 0,
      }));
    }
    
    results.total = results.companies.length + results.funding.length;
    logSearch('market', query, results, true);
    return results;
  } catch (e) {
    logSearch('market', query, null, false, e.message);
    return { error: 'Market search failed', details: e.message };
  }
}

// 4. Technical Search Engine (GitHub, Docs, Stack Overflow, APIs)
export async function technicalSearch(query, filters = {}) {
  const { language, framework, platform, stars, license } = filters;
  const results = { query, engine: 'technical', total: 0, repos: [], docs: [], qa: [], apis: [] };
  
  try {
    // GitHub Search API
    const github = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name,description&sort=stars&order=desc&per_page=20`,
      { headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN || ''}` } }
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // Stack Overflow API
    const stackOverflow = await fetch(
      `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodeURIComponent(query)}&site=stackoverflow&key=${process.env.SO_KEY || ''}`
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // DevDocs / ReadTheDocs
    const docs = await fetch(
      `https://readthedocs.org/api/v2/search/?q=${encodeURIComponent(query)}&per_page=20`
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // GitHub repos
    if (github?.items) {
      results.repos = github.items.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || '',
        url: repo.html_url,
        updated: repo.updated_at,
        license: repo.license?.spdx_id || 'Unknown',
      }));
    }
    
    // Stack Overflow Q&A
    if (stackOverflow?.items) {
      results.qa = stackOverflow.items.map(q => ({
        title: q.title || '',
        tags: q.tags || [],
        score: q.score || 0,
        answers: q.answer_count || 0,
        accepted: q.is_answered || false,
        link: q.link,
        created: new Date(q.creation_date * 1000).toISOString(),
      }));
    }
    
    // Documentation
    if (docs?.results) {
      results.docs = docs.results.map(d => ({
        title: d.title || '',
        project: d.project_name || '',
        version: d.version_name || '',
        link: d.url || '',
        highlight: d.highlight || '',
      }));
    }
    
    results.total = results.repos.length + results.qa.length + results.docs.length;
    logSearch('technical', query, results, true);
    return results;
  } catch (e) {
    logSearch('technical', query, null, false, e.message);
    return { error: 'Technical search failed', details: e.message };
  }
}

// 5. News Search Engine (Global news, press releases, sentiment)
export async function newsSearch(query, filters = {}) {
  const { source, dateFrom, dateTo, sentiment, language } = filters;
  const results = { query, engine: 'news', total: 0, articles: [], pressReleases: [], sentiment: null };
  
  try {
    // NewsAPI (global news sources)
    const newsAPI = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&pageSize=20&apiKey=${process.env.NEWS_API_KEY || ''}`
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // GDELT (Global Knowledge Graph - news analysis)
    const gdelt = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&format=json&maxrecords=20`
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // PRNewswire (press releases)
    const pressReleases = await fetch(
      `https://api.prnewswire.com/api/v1/releases/search?q=${encodeURIComponent(query)}&limit=20`,
      { headers: { 'Authorization': `Bearer ${process.env.PR_API_KEY || ''}` } }
    ).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // Parse NewsAPI
    if (newsAPI?.articles) {
      results.articles = newsAPI.articles.map(article => ({
        title: article.title || '',
        description: article.description || '',
        source: article.source?.name || '',
        author: article.author || 'Unknown',
        publishedAt: article.publishedAt || '',
        url: article.url,
        image: article.urlToImage || '',
        sentiment: analyzeSentiment(article.title + ' ' + article.description),
      }));
    }
    
    // Parse GDELT
    if (gdelt?.articles) {
      results.articles.push(...gdelt.articles.map(a => ({
        title: a.title || '',
        source: a.sourcecountry || 'Unknown',
        publishedAt: a.seendate || '',
        url: a.url || '',
        tone: a.tone || 0,
        sentiment: a.tone > 0 ? 'positive' : a.tone < 0 ? 'negative' : 'neutral',
      })));
    }
    
    // Press Releases
    if (pressReleases?.results) {
      results.pressReleases = pressReleases.results.map(pr => ({
        title: pr.title || '',
        company: pr.company_name || '',
        date: pr.release_date || '',
        url: pr.url || '',
        summary: pr.summary || '',
      }));
    }
    
    // Calculate overall sentiment
    const sentiments = results.articles.map(a => a.sentiment).filter(s => s);
    const positive = sentiments.filter(s => s === 'positive').length;
    const negative = sentiments.filter(s => s === 'negative').length;
    results.sentiment = {
      positive,
      negative,
      neutral: sentiments.length - positive - negative,
      overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral',
    };
    
    results.total = results.articles.length + results.pressReleases.length;
    logSearch('news', query, results, true);
    return results;
  } catch (e) {
    logSearch('news', query, null, false, e.message);
    return { error: 'News search failed', details: e.message };
  }
}

// COMBINED SEARCH (Compression-Ultra Refining Logic)
export async function compressionUltraSearch(query, engines = ['academic', 'legal', 'market', 'technical', 'news'], options = {}) {
  const startTime = Date.now();
  const results = {
    query,
    engines: {},
    combined: [],
    compressionUltra: {},
    timing: {},
  };
  
  // Run searches in parallel
  const searches = engines.map(engine => {
    const start = Date.now();
    switch (engine) {
      case 'academic': return academicSearch(query, options).then(r => ({ engine, result: r, time: Date.now() - start }));
      case 'legal': return legalSearch(query, options).then(r => ({ engine, result: r, time: Date.now() - start }));
      case 'market': return marketSearch(query, options).then(r => ({ engine, result: r, time: Date.now() - start }));
      case 'technical': return technicalSearch(query, options).then(r => ({ engine, result: r, time: Date.now() - start }));
      case 'news': return newsSearch(query, options).then(r => ({ engine, result: r, time: Date.now() - start }));
      default: return Promise.resolve({ engine, result: null, time: 0 });
    }
  });
  
  const allResults = await Promise.all(searches);
  
  // Compile results
  allResults.forEach(({ engine, result, time }) => {
    results.engines[engine] = { result, timeMs: time };
    results.combined.push({ engine, ...result });
  });
  
  // Compression-Ultra Refining Logic
  results.compressionUltra = {
    // Deduplicate across engines
    uniqueSources: compressUniqueSources(results.combined),
    
    // Extract key insights
    keyInsights: extractKeyInsights(results.combined, query),
    
    // Cross-reference findings
    crossReferences: findCrossReferences(results.combined),
    
    // Confidence scoring
    confidenceMap: buildConfidenceMap(results.combined),
    
    // Summary generation
    summary: generateSummary(results.combined, query),
    
    // Recommended actions
    recommendations: generateRecommendations(results.combined, query),
  };
  
  results.timing.totalMs = Date.now() - startTime;
  results.totalEngines = engines.length;
  results.successfulEngines = allResults.filter(r => !r.result?.error).length;
  
  // Log to self-improvement
  logSearch('compression-ultra', query, results, true);
  
  return results;
}

// Helper functions
function cleanText(text) {
  return (text || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, '').trim();
}

function analyzeSentiment(text) {
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'success', 'win', 'benefit', 'gain'];
  const negativeWords = ['bad', 'poor', 'terrible', 'negative', 'fail', 'loss', 'problem', 'issue'];
  const lower = (text || '').toLowerCase();
  const pos = positiveWords.filter(w => lower.includes(w)).length;
  const neg = negativeWords.filter(w => lower.includes(w)).length;
  return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
}

function compressUniqueSources(results) {
  const seen = new Set();
  return results.flatMap(r => 
    (r.result?.papers || r.result?.cases || r.result?.companies || r.result?.repos || r.result?.articles || [])
      .filter(item => {
        const id = item.id || item.url || item.link || item.title;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
  ).length;
}

function extractKeyInsights(results, query) {
  return results.map(r => ({
    engine: r.engine,
    insights: (r.result?.cases || r.result?.articles || r.result?.papers || r.result?.repos || []).slice(0, 3).map(item => ({
      title: item.title || item.name || '',
      relevance: calculateRelevance(item, query),
    }))
  }));
}

function calculateRelevance(item, query) {
  const text = JSON.stringify(item).toLowerCase();
  const queryWords = query.toLowerCase().split(' ');
  const matches = queryWords.filter(w => text.includes(w)).length;
  return Math.min(100, Math.round((matches / queryWords.length) * 100));
}

function findCrossReferences(results) {
  const allTitles = results.flatMap(r => 
    (r.result?.cases || r.result?.papers || r.result?.articles || []).map(i => (i.title || i.name || '').toLowerCase())
  );
  const duplicates = allTitles.filter((t, i) => allTitles.indexOf(t) !== i && t.length > 10);
  return [...new Set(duplicates)].map(t => ({ title: t, appearsIn: results.filter(r => 
    (r.result?.cases || r.result?.papers || r.result?.articles || []).some(i => (i.title || i.name || '').toLowerCase() === t)
  ).map(r => r.engine)));
}

function buildConfidenceMap(results) {
  return results.map(r => ({
    engine: r.engine,
    confidence: r.result?.error ? 0 : 
      r.engine === 'academic' ? 92 : 
      r.engine === 'legal' ? 88 : 
      r.engine === 'market' ? 76 : 
      r.engine === 'technical' ? 95 : 
      r.engine === 'news' ? 82 : 50,
    totalResults: r.result?.total || 0,
  }));
}

function generateSummary(results, query) {
  const total = results.reduce((sum, r) => sum + (r.result?.total || 0), 0);
  const engines = results.filter(r => !r.result?.error).length;
  return `Compression-Ultra analyzed "${query}" across ${engines} search engines, yielding ${total} total results. ${generateQuickInsight(results)}`;
}

function generateQuickInsight(results) {
  const insights = [];
  results.forEach(r => {
    if (r.result?.sentiment) insights.push(`${r.engine}: ${r.result.sentiment.overall} sentiment`);
    if (r.result?.cases?.length > 0) insights.push(`${r.engine}: ${r.result.cases.length} legal cases found`);
    if (r.result?.papers?.length > 0) insights.push(`${r.engine}: ${r.result.papers.length} academic papers`);
  });
  return insights.slice(0, 3).join('; ');
}

function generateRecommendations(results, query) {
  const recs = [];
  results.forEach(r => {
    if (r.engine === 'legal' && r.result?.cases?.length > 0) {
      recs.push({ priority: 'high', action: `Review ${r.result.cases.length} similar legal cases` });
    }
    if (r.engine === 'academic' && r.result?.papers?.length > 0) {
      recs.push({ priority: 'medium', action: `Cite ${Math.min(3, r.result.papers.length)} academic sources` });
    }
    if (r.engine === 'news' && r.result?.sentiment?.overall === 'negative') {
      recs.push({ priority: 'high', action: 'Negative sentiment detected - prepare response strategy' });
    }
  });
  return recs.slice(0, 5);
}

// Self-Improvement logging
function logSearch(engine, query, result, success, error = null) {
  const { logTask } = require('../lib/fortisSecurity.js');
  try {
    logTask(`search-${engine}`, { query, filters: result?.filters }, result, success, { error, engine });
  } catch (e) {}
}

// Import supabase dynamically
let supabaseInstance = null;
import('../lib/supabase').then(m => supabaseInstance = m?.supabase).catch(() => {});
