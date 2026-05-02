import { supabase } from '../lib/supabase';
import { logTask, getLearningInsights, getSuccessfulPattern } from '../lib/fortisSecurity';

// 3-Level Alarm System API
export default async function handler(req, res) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  if (req.method === 'OPTIONS') return res.status(200).json({});
  
  try {
    const { user } = await supabase.auth.getUser(req.headers.authorization?.replace('Bearer ', '') || '');
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { action, level, system, message, warningId, resolved } = req.body || {};
    
    switch (action) {
      case 'trigger-alarm':
        return await triggerAlarm(req, res, user, { level, system, message });
      case 'get-alarms':
        return await getAlarms(req, res, user);
      case 'resolve-alarm':
        return await resolveAlarm(req, res, user, warningId);
      case 'get-insights':
        return await getInsights(req, res, user);
      case 'log-task':
        return await logTaskEndpoint(req, res, user);
      case 'validate-email':
        return await validateEmailEndpoint(req, res, user);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (e) {
    console.error('Alarm API error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function triggerAlarm(req, res, user, { level, system, message }) {
  const { data, error } = await supabase
    .from('alarm_logs')
    .insert({
      level: level || 1,
      system: system || 'ujris',
      message: message || 'Automated alarm triggered',
      user_id: user.id,
      resolved: false,
      created_at: new Date(),
      metadata: {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      }
    })
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  
  // Log this task for self-improvement
  logTask('trigger-alarm', { level, system, message }, data, true);
  
  // AI-controlled intervention based on level
  const intervention = getIntervention(level, system);
  
  // Auto-escalate if Level 3+
  if (level >= 3) {
    await supabase.from('audit_logs').insert({
      action: 'CRITICAL_ALARM',
      user_id: user.id,
      details: { level, system, message, intervention },
      timestamp: new Date(),
    });
  }
  
  return res.status(200).json({ 
    success: true, 
    alarm: data?.[0], 
    intervention,
    levelConfig: LEVEL_CONFIG[level] || LEVEL_CONFIG[1]
  });
}

async function getAlarms(req, res, user) {
  const { data, error } = await supabase
    .from('alarm_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) return res.status(500).json({ error: error.message });
  
  // Log this task
  logTask('get-alarms', {}, data, true);
  
  return res.status(200).json({ 
    alarms: data || [],
    count: data?.length || 0,
    levelConfig: LEVEL_CONFIG
  });
}

async function resolveAlarm(req, res, user, warningId) {
  const { data, error } = await supabase
    .from('alarm_logs')
    .update({ resolved: true, resolved_by: user.id, resolved_at: new Date() })
    .eq('id', warningId)
    .select();
  
  if (error) return res.status(500).json({ error: error.message });
  
  logTask('resolve-alarm', { warningId }, data, true);
  
  return res.status(200).json({ success: true, alarm: data?.[0] });
}

async function getInsights(req, res, user) {
  const insights = getLearningInsights();
  const { data: alarmStats } = await supabase
    .from('alarm_logs')
    .select('level, system, resolved')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  
  const stats = {
    totalAlarms: alarmStats?.length || 0,
    byLevel: {},
    bySystem: {},
    resolutionRate: 0,
  };
  
  alarmStats?.forEach(a => {
    stats.byLevel[a.level] = (stats.byLevel[a.level] || 0) + 1;
    stats.bySystem[a.system] = (stats.bySystem[a.system] || 0) + 1;
  });
  
  const resolved = alarmStats?.filter(a => a.resolved).length || 0;
  stats.resolutionRate = stats.totalAlarms > 0 ? (resolved / stats.totalAlarms * 100).toFixed(2) + '%' : '0%';
  
  return res.status(200).json({ 
    insights, 
    stats,
    selfImprovementActive: true 
  });
}

async function logTaskEndpoint(req, res, user) {
  const { task, input, output, success, metadata } = req.body;
  const taskId = logTask(task, input, output, success !== false, metadata);
  
  return res.status(200).json({ 
    success: true, 
    taskId,
    learningActive: true 
  });
}

async function validateEmailEndpoint(req, res, user) {
  const { email } = req.body;
  const { validateEmailAsPrimary } = await import('../lib/fortisSecurity.js');
  const result = await validateEmailAsPrimary(email);
  
  logTask('validate-email', { email }, result, result.valid);
  
  return res.status(200).json(result);
}

function getIntervention(level, system) {
  const interventions = {
    1: {
      action: 'Monitor closely',
      notifications: ['Email to admin', 'In-app notification'],
      auto: false,
    },
    2: {
      action: 'Urgent intervention',
      notifications: ['SMS to admin', 'Email alert', 'Slack webhook'],
      auto: false,
    },
    3: {
      action: 'Critical response',
      notifications: ['Phone call to admin', 'SMS + Email', 'All hands on deck'],
      auto: true,
      autoActions: ['Freeze account', 'Flag for manual review', 'Alert security team'],
    },
    4: {
      action: 'EMERGENCY - Total intervention',
      notifications: ['Phone call cascade', 'Emergency contacts', 'Legal notice'],
      auto: true,
      autoActions: ['Lock system', 'Preserve evidence', 'Contact authorities', 'Activate backup systems'],
    },
  };
  return interventions[level] || interventions[1];
}

const LEVEL_CONFIG = {
  1: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Level 1 – Preparation', icon: '📋', description: 'Routine monitoring, no immediate threat' },
  2: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Level 2 – Urgent Action', icon: '⚠', description: 'Time-sensitive, requires action within 48h' },
  3: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)', label: 'Level 3 – Critical', icon: '🚨', description: 'Critical failure, immediate intervention required' },
  4: { color: '#7C2D12', bg: 'rgba(124,45,18,0.1)', label: 'Level 4 – EMERGENCY', icon: '🔴', description: 'System-wide emergency, activate all protocols' },
};
