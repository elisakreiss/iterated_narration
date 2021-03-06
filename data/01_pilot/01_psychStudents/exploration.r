library(tidyverse)

d = read_csv('data_raw_20180525.csv')

# inspect people who commented (specially on errors)
filter(d, comments != "")

# get the chain_number (not an elegant solution, unfortunately)
d$chain_number = as.integer(1)
for (i in 1:nrow(d)) {
  relevant_levels = filter(d, story_title == d$story_title[i])$chain %>% as.factor() %>% levels()
  d$chain_number[i] = which(relevant_levels == d$chain[i])
}
        
# how many chains/generations for which story
with(d, table(generation, chain_number, story_title))                                         
d %>% group_by(story_title, chain_number) %>% summarize(max_generation = max(generation)) %>% 
  mutate(chain_number = factor(chain_number, levels = 1:20)) %>% 
  ggplot(aes(x = chain_number, y = max_generation)) + 
  geom_bar(stat = 'identity') +
  facet_grid(~ story_title, scales = 'free') +
  xlab("chain number") + ylab("generation")

# look at the relevant bits of the data in order
dd = d %>% select(story_title, chain_number, generation, reproduction) %>% 
  arrange(story_title, chain_number, generation)

write.csv(dd, 'data_selection_ordered.csv')

