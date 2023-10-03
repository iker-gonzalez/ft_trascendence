import React, { useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import SearchBar from '../UI/SearchBar';
import Lottie from 'lottie-react';
import emptyAnimationData from '../../assets/lotties/empty-ghost.json';
import loadingAnimationData from '../../assets/lotties/spinner.json';
import styled from 'styled-components';
import { getBaseUrl } from '../../utils/utils';
import UserCoreData from '../../interfaces/user-core-data.interface';
import Cookies from 'js-cookie';
import UserItem from '../shared/UserItem';
import { useNavigate } from 'react-router-dom';

const WrapperDiv = styled.div`
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;

    .empty-animation {
      width: 250px;
      height: auto;
      object-fit: contain;
    }

    .loading-animation {
      width: 80px;
      margin: 75px 20px;
    }
  }

  .users-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;

    width: 100%;
  }
`;

type FriendsSearchModalProps = {
  setShowFriendsSearchModal: (arg0: boolean) => void;
};

const FriendsSearchModal: React.FC<FriendsSearchModalProps> = ({
  setShowFriendsSearchModal,
}): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [foundUsers, setFoundUsers] = useState<UserCoreData[]>([]);
  const navigate = useNavigate();

  const _formatSearchValue = (searchValue: string): string => {
    const formattedSearchValue: string = searchValue.trim().replaceAll(' ', '');

    return formattedSearchValue;
  };

  useEffect(() => {
    const fetchUsers = async (formattedSearchValue: string): Promise<void> => {
      let users: UserCoreData[] = [];
      try {
        const response = await fetch(
          `${getBaseUrl()}/users/search?query=${formattedSearchValue}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
            },
          },
        );

        // TODO abstract this logic everytime we fetch data from the API
        if (response.status === 401) {
          navigate('/');
        }

        const data = await response.json();
        console.log(data);

        users = data.data.friends;
        setFoundUsers(users);
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchValue.length > 0) setIsLoading(true);

    const debounceTimeout = setTimeout(() => {
      if (searchValue.length) {
        fetchUsers(searchValue);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchValue]);

  return (
    <Modal
      dismissModalAction={() => {
        setShowFriendsSearchModal(false);
      }}
    >
      <WrapperDiv>
        <h2 className="title-2 mb-24">Find a new game friends 👥</h2>
        <p className="mb-16">
          Use the search bar below to find players and add them to your friends
          list.
        </p>
        <SearchBar
          type="text"
          placeholder="Search... 🔍"
          value={searchValue}
          className="mb-24"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchValue(_formatSearchValue(e.target.value) as string);
          }}
        />
        {!Boolean(foundUsers.length) && (
          <div className="empty-state">
            {isLoading ? (
              <Lottie
                animationData={loadingAnimationData}
                loop={true}
                aria-hidden="true"
                className="loading-animation"
              />
            ) : (
              <Lottie
                animationData={emptyAnimationData}
                loop={true}
                aria-hidden="true"
                className="empty-animation"
              />
            )}
          </div>
        )}
        {Boolean(foundUsers.length) && (
          <div className="users-container">
            {foundUsers.map((user, index) => {
              if (index <= 3)
                return (
                  <UserItem
                    userData={user}
                    key={user.intraId.toString()}
                    headingLevel={3}
                  />
                );
            })}
          </div>
        )}
      </WrapperDiv>
    </Modal>
  );
};

export default FriendsSearchModal;
