
import React from 'react';
import { AlertTriangle, Info, Check } from 'lucide-react';
import { LineItem, ComplianceIssue } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AICommentaryProps {
  lineItem: LineItem;
  expanded: boolean;
}

// Mock compliance issues for demonstration
const getMockComplianceIssues = (lineItem: LineItem): ComplianceIssue[] => {
  if (!lineItem.ai_action || lineItem.ai_action === 'approve') return [];
  
  const issues: ComplianceIssue[] = [];
  
  if (lineItem.ai_action === 'adjust') {
    issues.push({
      rule_id: 'RATE-001',
      rule_name: 'Billing Rate Compliance',
      description: 'Hourly rate exceeds agreed rate for this timekeeper classification',
      severity: 'medium'
    });
  }
  
  if (lineItem.ai_action === 'reject') {
    issues.push({
      rule_id: 'NARR-002',
      rule_name: 'Narrative Detail Check',
      description: 'Narrative lacks sufficient detail to justify time spent',
      severity: 'high'
    });
  }
  
  if (lineItem.hours > 7) {
    issues.push({
      rule_id: 'TIME-001',
      rule_name: 'Block Billing Check',
      description: 'Time entry exceeds 7 hours, suggesting potential block billing',
      severity: 'medium'
    });
  }
  
  return issues;
};

// AI recommendation based on action
const getAIRecommendation = (lineItem: LineItem): string => {
  if (!lineItem.ai_action) return '';
  
  switch (lineItem.ai_action) {
    case 'approve':
      return 'This entry complies with billing guidelines and can be approved.';
    case 'adjust':
      return 'Consider adjusting the rate or hours to align with agreed billing terms.';
    case 'reject':
      return 'This entry does not comply with billing guidelines and should be rejected.';
    default:
      return '';
  }
};

const AICommentary: React.FC<AICommentaryProps> = ({ lineItem, expanded }) => {
  if (!expanded) return null;
  
  const issues = getMockComplianceIssues(lineItem);
  const recommendation = getAIRecommendation(lineItem);
  
  if (!lineItem.ai_action) {
    return (
      <Card className="mt-2 border-dashed border-gray-200">
        <CardContent className="py-4 text-center text-gray-500">
          <Info className="h-5 w-5 mx-auto mb-2" />
          <p className="text-sm">No AI analysis available for this line item.</p>
        </CardContent>
      </Card>
    );
  }
  
  let statusColor = 'bg-gray-50 border-gray-200';
  let statusIcon = <Info className="h-5 w-5 text-gray-500" />;
  
  switch (lineItem.ai_action) {
    case 'approve':
      statusColor = 'bg-green-50 border-l-green-500';
      statusIcon = <Check className="h-5 w-5 text-green-500" />;
      break;
    case 'adjust':
      statusColor = 'bg-amber-50 border-l-amber-500';
      statusIcon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
      break;
    case 'reject':
      statusColor = 'bg-red-50 border-l-red-500';
      statusIcon = <AlertTriangle className="h-5 w-5 text-red-500" />;
      break;
  }
  
  return (
    <Card className={`mt-2 border-l-4 ${statusColor}`}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center">
          {statusIcon}
          <CardTitle className="text-sm font-medium ml-2">
            AI Analysis Score: {lineItem.ai_score !== null ? `${lineItem.ai_score}/100` : 'N/A'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <p className="text-sm mb-2 font-medium">Recommendation:</p>
        <p className="text-sm mb-3">{recommendation}</p>
        
        {issues.length > 0 && (
          <>
            <p className="text-sm font-medium mb-2">Issues detected:</p>
            <ul className="space-y-2">
              {issues.map((issue, index) => (
                <li key={index} className="text-sm bg-gray-50 p-2 rounded-sm">
                  <div className="flex items-start">
                    <div className="mt-0.5">
                      {issue.severity === 'high' ? (
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{issue.rule_name}</p>
                      <p className="text-gray-700">{issue.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AICommentary;
