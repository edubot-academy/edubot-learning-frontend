// NotificationsPage.jsx - без зависимостей
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState(['Сегодня']);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Эмодзи для иконок
  const emojiIcons = {
    bell: '🔔',
    check: '✓',
    trash: '🗑️',
    chevron: '▼',
    course: '📚',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: '💡',
    message: '💬'
  };

  // Функция для группировки уведомлений по дням
  const groupByDays = () => {
    const groups = {};
    
    notifications.forEach(notif => {
      const date = new Date(notif.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dayLabel;
      if (date.toDateString() === today.toDateString()) {
        dayLabel = 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dayLabel = 'Вчера';
      } else {
        dayLabel = date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      
      if (!groups[dayLabel]) groups[dayLabel] = [];
      groups[dayLabel].push(notif);
    });
    
    return groups;
  };

  // Подсчет новых сегодняшних
  const countTodayUnread = () => {
    return notifications.filter(notif => {
      const date = new Date(notif.createdAt);
      const today = new Date();
      return !notif.read && date.toDateString() === today.toDateString();
    }).length;
  };

  // Загрузка мок-данных
  const loadNotifications = async (pageNum = 1) => {
    setLoading(true);
    
    // Имитация загрузки с API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Генерация мок-данных
    const mockData = [];
    const today = new Date();
    const itemsPerPage = 10;
    
    for (let i = 0; i < itemsPerPage; i++) {
      const id = `notif-${pageNum}-${i}`;
      const isToday = pageNum === 1 && i < 5;
      const isRead = Math.random() > 0.4;
      
      let date = new Date();
      if (!isToday) {
        const daysAgo = (pageNum - 1) * 2 + Math.floor(Math.random() * 3) + 1;
        date.setDate(today.getDate() - daysAgo);
      }
      
      date.setHours(8 + Math.floor(Math.random() * 10));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      // Типы уведомлений
      const types = ['course', 'success', 'warning', 'info'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      // Тексты
      const titles = [
        'Новый курс доступен',
        'Задание проверено',
        'Срок сдачи истекает',
        'Новое сообщение',
        'Курс обновлен',
        'Доступен сертификат',
        'Изменение расписания'
      ];
      
      const messages = [
        'Курс "Продвинутый JavaScript" добавлен в ваш кабинет',
        'Ваша работа успешно проверена преподавателем',
        'До конца сдачи осталось менее 24 часов',
        'Вы получили новое сообщение в чате',
        'Материалы курса были обновлены',
        'Сертификат об окончании готов к скачиванию',
        'Расписание вебинаров было изменено'
      ];
      
      mockData.push({
        id,
        type,
        icon: emojiIcons[type] || emojiIcons.info,
        title: titles[Math.floor(Math.random() * titles.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        read: isRead,
        createdAt: date.toISOString(),
        link: Math.random() > 0.5 ? '/courses/1' : undefined
      });
    }
    
    // Сортировка по дате
    mockData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setNotifications(prev => [...prev, ...mockData]);
    setHasMore(pageNum < 3); // Ограничим 3 страницы мок-данных
    setPage(pageNum);
    setLoading(false);
  };

  // Загрузить еще
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1);
    }
  };

  // Отметить как прочитанное
  const handleMarkAsRead = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    setNotifications(prev =>
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    toast.success('Отмечено как прочитанное');
  };

  // Прочитать все
  const handleMarkAllAsRead = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success('Все уведомления прочитаны');
  };

  // Удалить уведомление
  const handleDelete = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Уведомление удалено');
  };

  // Переключить день (свернуть/развернуть)
  const toggleDay = (day) => {
    setExpandedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Первая загрузка
  useEffect(() => {
    loadNotifications();
  }, []);

  // Группируем уведомления
  const notificationsByDay = groupByDays();
  const todayUnreadCount = countTodayUnread();

  return (
    <div className="mx-4 md:mx-12 py-6">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-xl">{emojiIcons.bell}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Уведомления
            </h1>
            {todayUnreadCount > 0 && (
              <span className="bg-orange-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                {todayUnreadCount} новых
              </span>
            )}
          </div>
          
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-2 text-sm"
          >
            <span className="text-lg">{emojiIcons.check}</span>
            Прочитать все
          </button>
        </div>
        <p className="text-gray-500 text-sm">
          Все ваши уведомления в одном месте
        </p>
      </div>

      {/* Основной блок */}
      <div className="bg-white rounded-xl border border-gray-200">
        {Object.keys(notificationsByDay).length === 0 && !loading ? (
          <div className="text-center py-16">
            <span className="text-5xl text-gray-300 block mb-4">{emojiIcons.bell}</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Уведомлений нет
            </h3>
            <p className="text-gray-500">
              Когда появятся новые уведомления, они будут здесь
            </p>
          </div>
        ) : (
          <div>
            {/* Список дней */}
            {Object.entries(notificationsByDay).map(([day, dayNotifications], index, array) => {
              const isToday = day === 'Сегодня';
              const isExpanded = expandedDays.includes(day);
              
              return (
                <div key={day}>
                  {/* Заголовок дня */}
                  <button
                    onClick={() => toggleDay(day)}
                    className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${isToday ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                      <span className={`font-medium ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
                        {day}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({dayNotifications.length})
                      </span>
                    </div>
                    <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      {emojiIcons.chevron}
                    </span>
                  </button>

                  {/* Уведомления дня */}
                  {isExpanded && (
                    <div className="px-2">
                      {dayNotifications.map(notification => {
                        const isNew = isToday && !notification.read;
                        
                        return (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${isNew ? 'bg-orange-50/30' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Оранжевая точка для новых */}
                              <div className="pt-1.5">
                                {isNew ? (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                ) : (
                                  <div className="w-2 h-2"></div>
                                )}
                              </div>

                              {/* Иконка */}
                              <div className={`p-2 rounded ${isNew ? 'bg-orange-100' : 'bg-gray-100'}`}>
                                <span className="text-sm">{notification.icon}</span>
                              </div>

                              {/* Контент */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h3 className={`font-medium ${isNew ? 'text-orange-700' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h3>
                                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                    {!notification.read && (
                                      <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="p-1 text-gray-400 hover:text-green-600 transition rounded"
                                        title="Отметить как прочитанное"
                                      >
                                        <span className="text-lg">{emojiIcons.check}</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDelete(notification.id)}
                                      className="p-1 text-gray-400 hover:text-red-600 transition rounded"
                                      title="Удалить"
                                    >
                                      <span className="text-lg">{emojiIcons.trash}</span>
                                    </button>
                                  </div>
                                </div>
                                
                                <p className={`text-sm mb-2 ${isNew ? 'text-orange-600' : 'text-gray-600'}`}>
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400">
                                    {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  
                                  {notification.link && (
                                    <a
                                      href={notification.link}
                                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                    >
                                      Перейти
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Разделитель дней */}
                  {index < array.length - 1 && (
                    <div className="relative h-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-4 bg-white text-sm text-gray-500">
                          {array[index + 1][0]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Пагинация */}
            {hasMore && (
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full py-3 text-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 transition text-sm font-medium"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Загрузка...
                    </span>
                  ) : (
                    'Загрузить больше уведомлений'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Скелетон при загрузке */}
        {loading && notifications.length === 0 && (
          <div className="p-6 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-start gap-3 ml-4">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2.5"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Информация внизу */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          Уведомления обновляются автоматически
        </p>
      </div>
    </div>
  );
};

export default NotificationsPage;