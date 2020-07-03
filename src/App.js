import React, { useEffect, useState } from 'react';
import './App.css';

class GithubStatusService
{
    baseUrl = 'https://kctbh9vrtdwd.statuspage.io/api/v2/';

    async summary()
    {
        return await this.get('summary.json');
    }

    async status()
    {
        return await this.get('status.json');
    }

    async incidents()
    {
        return await this.get('incidents.json');
    }

    async get(url)
    {
        const response = await fetch(`${this.baseUrl}/${url}`);
        return await response.json();
    }
}

function getDisplayName(WrappedComponent)
{
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function useAsyncCall(promiseFn)
{
    const [{loading, error, content }, setState] = useState({ });

    useEffect(() =>
    {
        setState({ loading: true });
        promiseFn().then(
            x => { setState({ content: x, loading: false }); },
            e => { setState({ error: e, loading: false });  });
        },[promiseFn]);

    return { loading, error, content };
}

function withAsyncContent(Component, promiseFn)
{
    const WithAsyncContent = (...props) =>
    {
        const { loading, error, content } = useAsyncCall(promiseFn);
        const loadingComponent = loading && (props.loadingComponent || <div>Loading...</div>);
        const errorComponent = error && (props.errorComponent || <div style={{ color: 'red' }}>{error.message}</div>);
        const noContentComponent = (!content || content.length === 0) && (props.noContentComponent || <div>There's no content</div>);
        const contentComponent = <Component content={content} {...props} />;

        return loadingComponent || errorComponent || noContentComponent || contentComponent;
    };

    WithAsyncContent.displayName = `WithAsyncContent(${getDisplayName(Component)})`;
    return WithAsyncContent;
}

function IncidentList(props)
{
    return props.content.incidents.map(x => (
        <div key={x.id}>
            <span>{x.name}</span>(<span style={{ color: 'green' }}>{x.status}</span>)
        </div>));
}

// We needed to create the service call as an object here,
// because if not, the useEffect of the useAsyncCall will keep
// firing again and again.
const GithubStatus = new GithubStatusService();
const GetIncidents = async () => await GithubStatus.incidents();
const AsyncIncidentList = withAsyncContent(IncidentList, GetIncidents);

function App()
{
    return (
        <div className="App">
            <AsyncIncidentList />
        </div>
    );
}

export default App;