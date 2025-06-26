import React from 'react';
import { Tabs, Tag } from 'antd';

interface StatusTab {
    key: string;
    label: string;
    count: number;
    content: React.ReactNode;
}

interface StatusTabsProps {
    tabs: StatusTab[];
    activeKey: string;
    onChange: (key: string) => void;
}

const { TabPane } = Tabs;

const StatusTabs: React.FC<StatusTabsProps> = ({ tabs, activeKey, onChange }) => {
    return (
        <Tabs
            activeKey={activeKey}
            onChange={onChange}
            type="card"
            size="large"
        >
            {tabs.map(tab => (
                <TabPane
                    tab={`${tab.label} (${tab.count})`}
                    key={tab.key}
                >
                    {tab.content}
                </TabPane>
            ))}
        </Tabs>
    );
};

export default StatusTabs; 