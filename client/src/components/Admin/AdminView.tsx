import { memo } from 'react';
import { useGetUsersQuery } from 'librechat-data-provider/react-query';
import { useAuthContext, useNewConvo } from '~/hooks';
import * as Accordion from '@radix-ui/react-accordion';
import { useListAssistantsQuery } from '~/data-provider';
import { defaultOrderQuery } from 'librechat-data-provider';
import { Crown, User } from 'lucide-react';

function AdminView() {
  const { isAuthenticated } = useAuthContext();
  const { newConversation } = useNewConvo();
  const { data: users = null } = useGetUsersQuery({ enabled: !!isAuthenticated });
  const { data: assistants = null } = useListAssistantsQuery(defaultOrderQuery, {
    select: (res) =>
      res.data.map(({ id, name, metadata, model }) => ({ id, name, metadata, model })),
  });

  console.log('newConversation', newConversation);
  console.log('usersQuery', users);
  console.log('assistants', assistants);

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-5 text-white">
      <h1 className="mb-4 text-lg font-medium">Lista utenti</h1>
      {users && (
        <Accordion.Root type="single" collapsible className="flex flex-col gap-2">
          {users.map((user, i) => (
            <Accordion.Item
              key={i}
              className="flex flex-col gap-2 rounded-2xl border border-gray-700 px-4 py-2"
              value={`item-${i}`}
            >
              <Accordion.Trigger className="w-full text-left">
                <div className="flex items-center gap-4">
                  {user.role === 'ADMIN' ? (
                    <Crown color="orange" size={20} />
                  ) : (
                    <User color="white" size={20} />
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-sm italic">{user.email}</span>
                </div>
              </Accordion.Trigger>
              <Accordion.Content>
                <form className="px-4">
                  {assistants?.map((assistant, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`assistant-${i}`}
                        name={`assistant-${i}`}
                        defaultChecked={false}
                      />
                      <label htmlFor={`assistant-${i}`}>{assistant.name}</label>
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="mt-2 rounded-md border border-gray-700 px-2 py-1.5 text-sm font-medium"
                  >
                    Salva
                  </button>
                </form>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </div>
  );
}

export default memo(AdminView);
