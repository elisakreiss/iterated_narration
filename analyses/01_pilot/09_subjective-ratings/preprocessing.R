library(tidyverse)
library(summarytools)
library(gridExtra)
library(here)

theme_set(theme_bw(18))

# df = read_csv(here("data","01_pilot","07_revised06","raw_confidential.csv"))
# 
# anonymous_df = select(df,-workerId)
# anonymous_df$submission_id = anonymous_df$submission_id - min(unique(anonymous_df$submission_id)) + 1
# 
# write.csv(anonymous_df, file = here("data","01_pilot","07_revised06","raw.csv"), row.names = FALSE)

df1 = read_csv(here("data","01_pilot","09_subjective-ratings","results1.csv"))
df1$subj = 1
df2 = read_csv(here("data","01_pilot","09_subjective-ratings","results2.csv"))
df2$subj = 2
df3 = read_csv(here("data","01_pilot","09_subjective-ratings","results3.csv"))
df3$subj = 3

df = bind_rows(df1, df2, df3)

glimpse(df)

# other info
df_subj = df %>% 
  select(subj,age,gender,education,languages,enjoyment,timeSpent,comments) %>% 
  distinct() %>% 
  mutate_at(vars(languages), funs(str_to_lower(.))) %>% 
  mutate_at(vars(age), funs(as.integer(.)))

p_age = ggplot(df_subj,aes(x=age)) + 
  geom_bar(width = .5,
           fill = "orange") 

p_gen = ggplot(df_subj,aes(x=gender)) +
  geom_bar(width = .5,
           fill = "orange")

p_edu = ggplot(df_subj,aes(x=education)) +
  geom_bar(width = .5,
           fill = "orange")

p_lang = ggplot(df_subj,aes(x=languages)) +
  geom_bar(width = .5,
           fill = "orange")

p_enj = ggplot(df_subj,aes(x=enjoyment)) + 
  geom_bar(width = .5,
           fill = "orange")

p_time = ggplot(df_subj,aes(x=timeSpent)) +
  geom_histogram(fill = "orange")

grid.arrange(p_age,p_gen,p_edu,p_lang,p_enj,p_time)

unique(df_subj$comments)

# plots

# condition split-up!

df_plots_slider = df %>% 
  filter(box_checked=="false")

p_slider = ggplot(df_plots_slider,aes(x=trial_type,y=slider_val)) +
  geom_point(alpha = 0.2,
             position = position_jitter(width = 0.1, height = 0),
             size = 2) + 
  # error bars 
  stat_summary(fun.data = "mean_cl_boot",
               geom = "linerange",
               color = "black",
               size = 1) + 
  # means
  stat_summary(fun.y = "mean",
               geom = "point",
               shape = 21,
               fill = "red",
               color = "black",
               size = 4) +
  # facet_grid(rows = vars(generation)) +
  theme(axis.text.x = element_text(angle = 45))

# TODO: needs to be separated by generation
df_plots_box = df %>% 
  # filter(box_checked=="true") %>% 
  select(box_checked,trial_type) %>% 
  group_by(trial_type,box_checked) %>% 
  summarize(total_count = n()) %>%
  spread(key=box_checked,value=total_count)  

p_checkbox = ggplot(df_plots_box,aes(x=trial_type,y=true)) +
  geom_bar(stat = "identity",
           fill = "orange") +
  facet_grid(rows = vars(generation)) +
  theme(axis.text.x = element_text(angle = 45))

grid.arrange(p_slider,p_checkbox)
