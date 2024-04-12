import { FormEvent, memo } from 'react';
import {
  useGetUsersQuery,
  useUpdateUserAssistantIdsMutation,
} from 'librechat-data-provider/react-query';
import { useAuthContext, useNewConvo } from '~/hooks';
import * as Accordion from '@radix-ui/react-accordion';
import { useListAssistantsQuery } from '~/data-provider';
import { TUser, defaultOrderQuery } from 'librechat-data-provider';
import { Crown, User } from 'lucide-react';
import { ChevronDownIcon } from '@radix-ui/react-icons';

function AdminView() {
  const { isAuthenticated } = useAuthContext();
  const { newConversation } = useNewConvo();
  const { data: users = null } = useGetUsersQuery({ enabled: !!isAuthenticated });
  const { data: assistants = null } = useListAssistantsQuery(defaultOrderQuery, {
    select: (res) =>
      res.data.map(({ id, name, metadata, model }) => ({ id, name, metadata, model })),
  });
  const updateUserAssistantIds = useUpdateUserAssistantIdsMutation();

  function handleFormSubmit(e: FormEvent<HTMLFormElement>, user: TUser) {
    e.preventDefault();
    const checkboxes: NodeListOf<HTMLInputElement> =
      e.currentTarget.querySelectorAll('[type="checkbox"]');
    const assistantIds: string[] = [];
    if (checkboxes.length) {
      for (const checkbox of checkboxes) {
        if (checkbox.checked) {
          assistantIds.push(checkbox.value);
        }
      }
    }
    updateUserAssistantIds.mutate(
      {
        userId: user.id,
        assistantIds,
      },
      {
        onError: (error: unknown) => {
          console.log(error);
        },
      },
    );
    return;
  }

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
              <Accordion.Trigger className="flex w-full justify-between gap-2 text-left">
                <div className="flex items-center gap-4">
                  {user.role === 'ADMIN' ? (
                    <Crown color="orange" size={20} />
                  ) : (
                    <User color="white" size={20} />
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-sm italic">{user.email}</span>
                </div>
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
              </Accordion.Trigger>
              <Accordion.Content>
                <form onSubmit={(e) => handleFormSubmit(e, user)} className="px-4">
                  <div className="flex flex-col gap-3">
                    {assistants?.map(
                      (assistant: { name: string | null; id: string }, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`assistant-${i}`}
                            name={`assistant-${i}`}
                            defaultChecked={user.assistantIds.includes(assistant.id)}
                            value={assistant.id}
                          />
                          <label
                            htmlFor={`assistant-${i}`}
                            className="flex cursor-pointer flex-col leading-none"
                          >
                            <span>{assistant.name}</span>
                            <span className="text-xs">{assistant.id}</span>
                          </label>
                        </div>
                      ),
                    )}
                  </div>
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
