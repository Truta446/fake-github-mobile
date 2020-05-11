import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
    Container,
    Header,
    Avatar,
    Name,
    Bio,
    Loading,
    Stars,
    Starred,
    OwnerAvatar,
    Info,
    Title,
    Author,
} from './styles';

class User extends Component {
    static propTypes = {
        route: PropTypes.shape({
            params: PropTypes.shape({
                user: PropTypes.shape({
                    name: PropTypes.string.isRequired,
                    login: PropTypes.string.isRequired,
                }).isRequired,
            }).isRequired,
        }).isRequired,
        navigation: PropTypes.shape({
            navigate: PropTypes.func,
        }).isRequired,
    };

    state = {
        stars: [],
        page: 1,
        loading: true,
        refreshing: false,
    };

    async componentDidMount() {
        this.load();
    }

    load = async (page = 1) => {
        const { stars } = this.state;
        const { route } = this.props;

        const user = route.params?.user?.login;

        const { data } = await api.get(`/users/${user}/starred`, {
            params: { page },
        });

        this.setState({
            stars: page >= 2 ? [...stars, ...data] : data,
            page,
            loading: false,
            refreshing: false,
        });
    };

    loadMore = () => {
        const { page } = this.state;

        const nextPage = page + 1;

        this.load(nextPage);
    };

    refreshList = () => {
        this.setState({ refreshing: true, stars: [] }, this.load);
    };

    handleNavigate = (repository) => {
        const { navigation } = this.props;

        console.tron.log(repository);
        console.tron.log(navigation);

        navigation.navigate('Repository', { repository });
    };

    render() {
        const { route } = this.props;
        const { stars, loading, refreshing } = this.state;

        const user = route.params?.user;

        return (
            <Container>
                <Header>
                    <Avatar source={{ uri: user.avatar }} />
                    <Name>{user.name}</Name>
                    <Bio>{user.bio}</Bio>
                </Header>

                {loading ? (
                    <Loading />
                ) : (
                    <Stars
                        data={stars}
                        onRefresh={this.refreshList}
                        refreshing={refreshing}
                        onEndReachedThreshold={0.2}
                        onEndReached={this.loadMore}
                        keyExtractor={(star) => String(star.id)}
                        renderItem={({ item }) => (
                            <Starred onPress={() => this.handleNavigate(item)}>
                                <OwnerAvatar
                                    source={{ uri: item.owner.avatar_url }}
                                />
                                <Info>
                                    <Title>{item.name}</Title>
                                    <Author>{item.owner.login}</Author>
                                </Info>
                            </Starred>
                        )}
                    />
                )}
            </Container>
        );
    }
}

export default User;
