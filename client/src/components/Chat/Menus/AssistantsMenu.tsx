import { useEffect, useMemo, useState } from 'react';
import type { Option } from '~/common';
import { useAuthContext, useLocalize, useSetIndexOptions } from '~/hooks';
import { useListAssistantsQuery } from '~/data-provider';
import { mapAssistants } from '~/utils';
import { defaultOrderQuery } from 'librechat-data-provider';
import type { TPreset } from 'librechat-data-provider';
import { useChatContext } from '~/Providers';
import { Content, Portal, Root, Close } from '@radix-ui/react-popover';
import { TitleButton } from './UI';

export default function AssistantsMenu() {
  const { user } = useAuthContext();

  const { conversation } = useChatContext();
  const { setOption } = useSetIndexOptions();
  const localize = useLocalize();

  const defaultOption = useMemo(
    () => ({ label: localize('com_endpoint_use_active_assistant'), value: '' }),
    [localize],
  );

  const { data: assistants = [] } = useListAssistantsQuery(defaultOrderQuery, {
    select: (res) =>
      [
        defaultOption,
        ...res.data
          .map(({ id, name }) => ({
            label: name,
            value: id,
          }))
          .filter(({ value }) => user?.role === 'ADMIN' || user?.assistantIds.includes(value)),
      ].filter(Boolean),
  });

  const { data: assistantMap = {} } = useListAssistantsQuery(defaultOrderQuery, {
    select: (res) => mapAssistants(res.data),
  });

  const { assistant_id } = conversation ?? {};

  const activeAssistant = useMemo(() => {
    if (assistant_id) {
      return assistantMap[assistant_id];
    }

    return null;
  }, [assistant_id, assistantMap]);

  const [assistantValue, setAssistantValue] = useState<Option>(
    activeAssistant ? { label: activeAssistant.name, value: activeAssistant.id } : defaultOption,
  );

  useEffect(() => {
    if (assistantValue && assistantValue.value === '') {
      setOption('presetOverride')({
        assistant_id: assistantValue.value,
      } as Partial<TPreset>);
    }

    // Reason: `setOption` causes a re-render on every update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantValue]);

  const setAssistant = (value: string) => {
    console.log('calling setAssistant with value: ', value);
    if (!value) {
      setAssistantValue(defaultOption);
      return;
    }

    const assistant = assistantMap[value];
    if (!assistant) {
      setAssistantValue(defaultOption);
      return;
    }

    setAssistantValue({
      label: assistant.name ?? '',
      value: assistant.id ?? '',
    });
    setOption('assistant_id')(assistant.id);
  };

  useEffect(() => {
    if (assistantValue.value === '' && activeAssistant) {
      setAssistantValue({ label: activeAssistant.name || undefined, value: activeAssistant.id });
    }
  }, [assistantValue, activeAssistant]);

  useEffect(() => {
    if (activeAssistant) {
      setAssistantValue({ label: activeAssistant.name || undefined, value: activeAssistant.id });
    }
  }, [activeAssistant]);

  if (!conversation) {
    return null;
  }

  if (assistantValue.value === '') {
    return <></>;
  }

  if (conversation.conversationId !== 'new') {
    return (
      <p className="group flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2 text-lg font-medium hover:bg-gray-50 radix-state-open:bg-gray-50 dark:hover:bg-gray-700 dark:radix-state-open:bg-gray-700">
        {assistantValue.label}
      </p>
    );
  }

  return (
    <Root>
      <TitleButton primaryText={assistantValue.label + ' '} />
      <Portal>
        <div
          style={{
            position: 'fixed',
            left: '0px',
            top: '0px',
            transform: 'translate3d(268px, 50px, 0px)',
            minWidth: 'max-content',
            zIndex: 'auto',
          }}
        >
          <Content
            side="bottom"
            align="start"
            className="mt-2 max-h-[65vh] min-w-[340px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white lg:max-h-[75vh]"
          >
            {assistants
              .filter((item) => item.value)
              .map((assistant) => (
                <Close asChild key={`assistant-${assistant.value}`}>
                  <div
                    onClick={() => setAssistant(assistant.value)}
                    className="group m-1.5 flex max-h-[40px] cursor-pointer justify-between gap-2 rounded px-5 py-2.5 !pr-3 text-sm !opacity-100 hover:bg-black/5 focus:ring-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 dark:hover:bg-gray-600"
                  >
                    <span>{assistant.label}</span>
                    {assistant.value === assistantValue.value && (
                      <span>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon-md block"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.0755 7.93219C16.5272 8.25003 16.6356 8.87383 16.3178 9.32549L11.5678 16.0755C11.3931 16.3237 11.1152 16.4792 10.8123 16.4981C10.5093 16.517 10.2142 16.3973 10.0101 16.1727L7.51006 13.4227C7.13855 13.014 7.16867 12.3816 7.57733 12.0101C7.98598 11.6386 8.61843 11.6687 8.98994 12.0773L10.6504 13.9039L14.6822 8.17451C15 7.72284 15.6238 7.61436 16.0755 7.93219Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </Close>
              ))}
          </Content>
        </div>
      </Portal>
    </Root>
  );
}
